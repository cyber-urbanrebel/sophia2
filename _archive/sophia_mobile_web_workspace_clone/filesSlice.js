import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  storageUsed: 3.4,
  storageLimit: 10,
  tree: [
    {
      id: nanoid(),
      name: 'projects',
      type: 'folder',
      children: [
        {
          id: nanoid(),
          name: 'linked_list_lab.py',
          type: 'file',
          ext: 'py',
          size: 12,
        },
        {
          id: nanoid(),
          name: 'fourier_notes.md',
          type: 'file',
          ext: 'md',
          size: 8,
        },
      ],
    },
    {
      id: nanoid(),
      name: 'research.pdf',
      type: 'file',
      ext: 'pdf',
      size: 142,
    },
  ],
  selectedPath: null,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    createFile(state, action) {
      const { folderId, name, ext, size } = action.payload;
      const parent = findNodeById(state.tree, folderId);
      if (parent && parent.type === 'folder') {
        parent.children.push({
          id: nanoid(),
          name,
          type: 'file',
          ext,
          size,
        });
      }
    },
    toggleFolder(state, action) {
      const node = findNodeById(state.tree, action.payload);
      if (node && node.type === 'folder') {
        node.expanded = !node.expanded;
      }
    },
    selectFile(state, action) {
      state.selectedPath = action.payload;
    },
  },
});

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === 'folder' && node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export const { createFile, toggleFolder, selectFile } = filesSlice.actions;
export default filesSlice.reducer;
