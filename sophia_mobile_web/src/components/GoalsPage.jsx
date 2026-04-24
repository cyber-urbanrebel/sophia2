import React, { useState, useEffect } from 'react';

const GoalsPage = ({ goals, setGoals }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    domain: 'Health',
    description: '',
    whyItMatters: '',
    targetDate: '',
    milestones: []
  });
  const [milestoneInput, setMilestoneInput] = useState('');
  const [errors, setErrors] = useState({});

  const domains = ['Health', 'Career', 'Finances', 'Relationships', 'Personal Growth', 'Spiritual'];

  const domainColors = {
    'Health': '#00FF88',
    'Career': '#00FFFF',
    'Finances': '#FFD23F',
    'Relationships': '#FF6B35',
    'Personal Growth': '#BB88FF',
    'Spiritual': '#FF88AA'
  };

  // Calculate stats
  const totalGoals = goals.length;
  const onTrackGoals = goals.filter(g => g.progress >= 50).length;
  const completedGoals = goals.filter(g => g.progress === 100).length;
  const overdueGoals = goals.filter(g => new Date(g.targetDate) < new Date() && g.progress < 100).length;

  const calculateProgress = (milestones) => {
    if (milestones.length === 0) return 0;
    const doneCount = milestones.filter(m => m.done).length;
    return Math.round((doneCount / milestones.length) * 100);
  };

  const handleAddMilestone = () => {
    if (milestoneInput.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { id: Date.now(), text: milestoneInput.trim(), done: false }]
      }));
      setMilestoneInput('');
    }
  };

  const handleRemoveMilestone = (id) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const handleMilestoneToggle = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(m =>
          m.id === milestoneId ? { ...m, done: !m.done } : m
        );
        return {
          ...goal,
          milestones: updatedMilestones,
          progress: calculateProgress(updatedMilestones)
        };
      }
      return goal;
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.targetDate) newErrors.targetDate = 'Target date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const goalData = {
      ...formData,
      id: editingGoal ? editingGoal.id : Date.now(),
      progress: calculateProgress(formData.milestones),
      createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString()
    };

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? goalData : g));
    } else {
      setGoals(prev => [...prev, goalData]);
    }

    handleCancel();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      domain: 'Health',
      description: '',
      whyItMatters: '',
      targetDate: '',
      milestones: []
    });
    setMilestoneInput('');
    setErrors({});
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      domain: goal.domain,
      description: goal.description,
      whyItMatters: goal.whyItMatters,
      targetDate: goal.targetDate,
      milestones: goal.milestones
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingText = (targetDate, progress) => {
    if (progress === 100) return { text: 'Completed ✓', color: 'text-cyan-400' };
    
    const days = getDaysRemaining(targetDate);
    if (days < 0) return { text: `${Math.abs(days)} days overdue ✕`, color: 'text-red-400' };
    if (days <= 7) return { text: `${days} days ⚠`, color: 'text-yellow-400' };
    return { text: `${days} days`, color: 'text-green-400' };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{totalGoals}</div>
          <div className="text-sm text-neutral-400">Total Goals</div>
        </div>
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-green-400 border-opacity-20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{onTrackGoals}</div>
          <div className="text-sm text-neutral-400">On Track (≥50%)</div>
        </div>
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-yellow-400 border-opacity-20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{completedGoals}</div>
          <div className="text-sm text-neutral-400">Completed</div>
        </div>
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-red-400 border-opacity-20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{overdueGoals}</div>
          <div className="text-sm text-neutral-400">Overdue</div>
        </div>
      </div>

      {/* New Goal Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-5 rounded-lg transition-all duration-200"
        >
          + New Goal
        </button>
      </div>

      {/* Collapsible Form */}
      {showForm && (
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6 mb-8">
          <h3 className="text-2xl font-display font-bold text-cyan-400 mb-6">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Goal title *"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`bg-black bg-opacity-50 border ${errors.title ? 'border-red-400' : 'border-cyan-400 border-opacity-30'} rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400`}
              />
              {errors.title && <div className="text-red-400 text-sm mt-1">{errors.title}</div>}
            </div>
            
            <div>
              <select
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              className={`bg-black bg-opacity-50 border ${errors.targetDate ? 'border-red-400' : 'border-cyan-400 border-opacity-30'} rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400`}
            />
            {errors.targetDate && <div className="text-red-400 text-sm mt-1">{errors.targetDate}</div>}
          </div>

          <div className="mb-4">
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-20"
            />
          </div>

          <div className="mb-4">
            <textarea
              placeholder="Why it matters"
              value={formData.whyItMatters}
              onChange={(e) => setFormData(prev => ({ ...prev, whyItMatters: e.target.value }))}
              className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-20"
            />
          </div>

          {/* Milestones */}
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add milestone"
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-2 text-neutral-200 flex-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                onClick={handleAddMilestone}
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {formData.milestones.map(milestone => (
                <div key={milestone.id} className="flex items-center gap-2">
                  <span className="text-neutral-300 flex-1">{milestone.text}</span>
                  <button
                    onClick={() => handleRemoveMilestone(milestone.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-5 rounded-lg transition-all duration-200"
            >
              {editingGoal ? 'Update' : 'Save'} Goal
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-400 hover:bg-red-300 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-display font-bold text-cyan-400 mb-2">No goals yet</h3>
          <p className="text-neutral-400">Start your journey by creating your first goal above.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const daysInfo = getDaysRemainingText(goal.targetDate, goal.progress);
            return (
              <div key={goal.id} className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold text-black"
                    style={{ backgroundColor: domainColors[goal.domain] + '26' }}
                  >
                    {goal.domain.toUpperCase()}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(goal)} className="text-cyan-400 hover:text-cyan-300">✏️</button>
                    <button onClick={() => handleDelete(goal.id)} className="text-red-400 hover:text-red-300">🗑️</button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-display font-bold text-neutral-200 mb-2">{goal.title}</h3>
                
                {/* Description */}
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{goal.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Progress</span>
                    <span className="text-neutral-200">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%`, backgroundColor: domainColors[goal.domain] }}
                    ></div>
                  </div>
                </div>

                {/* Days Remaining */}
                <div className={`text-sm mb-4 ${daysInfo.color}`}>
                  {daysInfo.text}
                </div>

                {/* Milestones */}
                <div className="mb-4">
                  {goal.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={milestone.done}
                        onChange={() => handleMilestoneToggle(goal.id, milestone.id)}
                        className="w-4 h-4 text-cyan-400 bg-neutral-700 border-neutral-600 rounded focus:ring-cyan-400"
                      />
                      <span className={`text-sm ${milestone.done ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                        {milestone.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Why it matters */}
                {goal.whyItMatters && (
                  <>
                    <hr className="border-neutral-700 mb-2" />
                    <p className="text-neutral-400 italic font-heading text-sm">{goal.whyItMatters}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;