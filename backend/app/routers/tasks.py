from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user_id
from app.models import Task
from app.schemas import CreateTaskRequest, TaskPublic, UpdateTaskRequest

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _to_public(task: Task) -> TaskPublic:
    return TaskPublic(
        id=task.id, user_id=task.user_id, title=task.title, priority=task.priority,
        completed=task.completed, created_at=task.created_at, completed_at=task.completed_at,
    )


@router.get("", response_model=list[TaskPublic])
def list_tasks(
    filter: str = Query(default="all", pattern="^(all|active|completed)$"),
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    tasks = session.exec(
        select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())  # type: ignore[union-attr]
    ).all()
    if filter == "active":
        tasks = [t for t in tasks if not t.completed]
    elif filter == "completed":
        tasks = [t for t in tasks if t.completed]
    return [_to_public(t) for t in tasks]


@router.post("", response_model=TaskPublic, status_code=status.HTTP_201_CREATED)
def create_task(
    body: CreateTaskRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    task = Task(user_id=user_id, title=body.title, priority=body.priority)
    session.add(task)
    session.commit()
    session.refresh(task)
    return _to_public(task)


def _get_owned_task(session: Session, user_id: str, task_id: str) -> Task:
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="task_not_found")
    return task


@router.put("/{task_id}", response_model=TaskPublic)
def update_task(
    task_id: str,
    body: UpdateTaskRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    task = _get_owned_task(session, user_id, task_id)
    if body.title is not None:
        task.title = body.title
    if body.priority is not None:
        task.priority = body.priority
    if body.completed is not None:
        task.completed = body.completed
        task.completed_at = datetime.now(timezone.utc).isoformat() if body.completed else None
    session.add(task)
    session.commit()
    session.refresh(task)
    return _to_public(task)


@router.post("/{task_id}/complete", response_model=TaskPublic)
def complete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    task = _get_owned_task(session, user_id, task_id)
    task.completed = True
    task.completed_at = datetime.now(timezone.utc).isoformat()
    session.add(task)
    session.commit()
    session.refresh(task)
    return _to_public(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    task = _get_owned_task(session, user_id, task_id)
    session.delete(task)
    session.commit()
