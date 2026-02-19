'use client';

import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { GeneratedFile } from '@/types';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: FileTreeNode[];
  file?: GeneratedFile;
}

function buildFileTree(files: GeneratedFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split('/').filter(Boolean);
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let existing = currentLevel.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: isFile ? 'file' : 'directory',
          children: [],
          file: isFile ? file : undefined,
        };
        currentLevel.push(existing);
      }

      if (!isFile) {
        currentLevel = existing.children;
      }
    });
  });

  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map((node) => ({
      ...node,
      children: sortNodes(node.children),
    }));
  };

  return sortNodes(root);
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    py: 'python',
    css: 'css',
    scss: 'scss',
    html: 'html',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    dockerfile: 'docker',
    env: 'bash',
    toml: 'toml',
    xml: 'xml',
    graphql: 'graphql',
    prisma: 'graphql',
  };
  return langMap[ext || ''] || 'text';
}

interface TreeNodeProps {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (file: GeneratedFile) => void;
}

function TreeNode({ node, depth, selectedPath, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          )}
          {expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-indigo-400" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-indigo-400" />
          )}
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {expanded && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.file && onSelect(node.file)}
      className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
        isSelected
          ? 'bg-indigo-500/10 text-indigo-400'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
      style={{ paddingLeft: `${depth * 16 + 8 + 18}px` }}
    >
      <File className={`h-4 w-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

interface FileBrowserProps {
  files: GeneratedFile[];
}

export function FileBrowser({ files }: FileBrowserProps) {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(
    files.length > 0 ? files[0] : null
  );

  const tree = useMemo(() => buildFileTree(files), [files]);

  return (
    <div className="flex h-[600px] overflow-hidden rounded-xl border border-white/10 bg-gray-900/60">
      {/* File tree panel */}
      <div className="w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-gray-900/80 py-2">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedFile?.path || null}
            onSelect={setSelectedFile}
          />
        ))}
      </div>

      {/* Code viewer panel */}
      <div className="flex-1 overflow-auto">
        {selectedFile ? (
          <div className="flex h-full flex-col">
            {/* File header */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-gray-900/80 px-4 py-2">
              <File className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-300">
                {selectedFile.path}
              </span>
            </div>
            {/* Code content */}
            <div className="flex-1 overflow-auto">
              <SyntaxHighlighter
                language={getLanguage(selectedFile.path)}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  minHeight: '100%',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  background: 'transparent',
                }}
                showLineNumbers
                lineNumberStyle={{
                  minWidth: '3em',
                  paddingRight: '1em',
                  color: '#636e7b',
                  userSelect: 'none',
                }}
              >
                {selectedFile.content}
              </SyntaxHighlighter>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p className="text-sm">Select a file to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}
