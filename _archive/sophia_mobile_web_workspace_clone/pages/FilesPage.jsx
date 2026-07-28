import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createFile, toggleFolder, selectFile } from '../store/slices/filesSlice.js';
import styles from '../styles/Files.module.css';

function formatSize(mb) {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function badgeColor(ext) {
  switch (ext) {
    case 'py':
      return styles.badgeGreen;
    case 'js':
      return styles.badgeYellow;
    case 'md':
      return styles.badgeBlue;
    case 'pdf':
      return styles.badgeCoral;
    case 'c':
      return styles.badgePurple;
    default:
      return styles.badgeGray;
  }
}

function TreeItem({ node, onToggle, onSelect, selectedId }) {
  const isFolder = node.type === 'folder';
  const expanded = node.expanded;

  return (
    <div className={styles.node}>
      <div className={styles.nodeLabel}>
        {isFolder && (
          <button type="button" className={styles.folderToggle} onClick={() => onToggle(node.id)}>
            {expanded ? '▾' : '▸'}
          </button>
        )}
        <button
          type="button"
          className={
            selectedId === node.id
              ? `${styles.nodeButton} ${styles.selected}`
              : styles.nodeButton
          }
          onClick={() => onSelect(node.id)}
        >
          <span className={styles.nodeIcon}>{isFolder ? '📁' : '📄'}</span>
          <span className={styles.nodeName}>{node.name}</span>
          {!isFolder && <span className={`${styles.badge} ${badgeColor(node.ext)}`}>{node.ext}</span>}
        </button>
      </div>
      {isFolder && expanded && node.children && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilesPage() {
  const dispatch = useDispatch();
  const { tree, storageUsed, storageLimit, selectedPath } = useSelector((state) => state.files);
  const [newFileName, setNewFileName] = useState('');
  const [newFileExt, setNewFileExt] = useState('py');

  const percent = useMemo(() => Math.min((storageUsed / storageLimit) * 100, 100), [storageUsed, storageLimit]);

  const handleCreate = () => {
    if (!newFileName.trim()) return;

    const fileName = `${newFileName.trim()}_${newFileExt}.${newFileExt}`;
    dispatch(createFile({ folderId: tree[0].id, name: fileName, ext: newFileExt, size: 1.2 }));
    setNewFileName('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Files</h2>
        <button type="button" className={styles.newFileButton} onClick={handleCreate}>
          + New File
        </button>
      </header>

      <div className={styles.storageBar}>
        <span className={styles.storageLabel}>Storage</span>
        <span className={styles.storageValue}>{`${storageUsed.toFixed(1)} GB / ${storageLimit.toFixed(0)} GB`}</span>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className={styles.treeContainer}>
        {tree.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            onToggle={(id) => dispatch(toggleFolder(id))}
            onSelect={(id) => dispatch(selectFile(id))}
            selectedId={selectedPath}
          />
        ))}
      </div>

      <div className={styles.createRow}>
        <input
          className={styles.input}
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="File name (e.g., linked_list_lab)"
        />
        <select className={styles.select} value={newFileExt} onChange={(e) => setNewFileExt(e.target.value)}>
          <option value="py">.py</option>
          <option value="js">.js</option>
          <option value="md">.md</option>
          <option value="pdf">.pdf</option>
          <option value="c">.c</option>
        </select>
      </div>
    </div>
  );
}
