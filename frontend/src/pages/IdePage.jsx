import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { NOTATION_TEMPLATES, DEFAULT_NOTATION_KEY, findTemplate } from '../dsl/notations.js';
import * as diagramsApi from '../api/diagramsApi.js';
import { ApiError } from '../api/client.js';
import { Titlebar } from '../components/ide/Titlebar.jsx';
import { ActivityBar } from '../components/ide/ActivityBar.jsx';
import { Sidebar } from '../components/ide/Sidebar.jsx';
import { EditorPane } from '../components/ide/EditorPane.jsx';
import { CanvasPane } from '../components/ide/CanvasPane.jsx';
import { BottomPanel } from '../components/ide/BottomPanel.jsx';
import { StatusBar } from '../components/ide/StatusBar.jsx';
import { Toast } from '../components/ide/Toast.jsx';

const DEFAULT_TITLE = 'Untitled.dsl';
const TOAST_DURATION_MS = 3500;

function stripExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, '');
}

export function IdePage() {
  const { token, email, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLocale();
  const navigate = useNavigate();

  const initialTemplate = findTemplate(DEFAULT_NOTATION_KEY);

  const [code, setCode] = useState(initialTemplate.template);
  const [notationKey, setNotationKey] = useState(DEFAULT_NOTATION_KEY);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(DEFAULT_NOTATION_KEY);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [diagramId, setDiagramId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const [files, setFiles] = useState([]);
  const [templatesFilter, setTemplatesFilter] = useState('');
  const [filesFilter, setFilesFilter] = useState('');

  const [svg, setSvg] = useState(null);
  const [issues, setIssues] = useState([]);
  const [terminalLines, setTerminalLines] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');

  const [zoomPercent, setZoomPercent] = useState(100);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const terminalCounter = useRef(0);
  const toastTimerRef = useRef(null);

  const appendTerminal = useCallback((text, kind = '') => {
    terminalCounter.current += 1;
    const id = terminalCounter.current;
    setTerminalLines((lines) => [...lines, { id, text, kind }].slice(-100));
  }, []);

  const showToast = useCallback((type, message) => {
    const label = type === 'ok' ? t('toastOk') : type === 'warning' ? t('toastWarning') : t('toastError');
    setToast({ type, message, label });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, [t]);

  useEffect(() => () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  }, []);

  const handleAuthFailure = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const refreshFiles = useCallback(async () => {
    try {
      const list = await diagramsApi.listDiagrams(token);
      setFiles(list);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthFailure();
      }
    }
  }, [token, handleAuthFailure]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  function handleCodeChange(nextCode) {
    setCode(nextCode);
    setDirty(true);
  }

  async function handleRun() {
    setRunning(true);
    const start = performance.now();
    try {
      const response = await diagramsApi.renderDsl(code, token);
      const elapsedMs = Math.round(performance.now() - start);
      setSvg(response.svg || null);
      setIssues(response.issues || []);
      const errorCount = response.issues.filter((issue) => issue.severity === 'error').length;
      const warningCount = response.issues.filter((issue) => issue.severity === 'warning').length;
      appendTerminal(`> POST /api/v1/diagrams/render`);
      if (errorCount > 0) {
        appendTerminal(`✗ ${errorCount} error(s), ${warningCount} warning(s) — ${elapsedMs}ms`, 'err');
        setActiveBottomTab('problems');
        showToast('error', `${errorCount} error(s) found`);
      } else {
        appendTerminal(`✓ 0 errors, ${warningCount} warning(s) — rendered in ${elapsedMs}ms`, 'ok');
        showToast(warningCount > 0 ? 'warning' : 'ok', t('diagramRendered'));
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthFailure();
        return;
      }
      appendTerminal(`✗ ${err.message}`, 'err');
      showToast('error', err.message);
    } finally {
      setRunning(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      let id = diagramId;
      if (!id) {
        const created = await diagramsApi.createDiagram(stripExtension(title) || 'Untitled', notationKey, token);
        id = created.id;
        setDiagramId(id);
      }
      appendTerminal(`> POST /api/v1/diagrams/${id}/versions`);
      const commit = await diagramsApi.saveVersion(id, code, '', token);
      appendTerminal(`✓ commit ${commit.id.slice(0, 8)} saved by ${commit.author}`, 'ok');
      setDirty(false);
      setSaveFailed(false);
      showToast('ok', t('diagramSaved'));
      refreshFiles();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthFailure();
        return;
      }
      setSaveFailed(true);
      appendTerminal(`✗ ${err.message}`, 'err');
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    try {
      const { filename, content } = await diagramsApi.exportDiagram(diagramId, token);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      appendTerminal(`> GET /api/v1/diagrams/${diagramId}/export`);
      appendTerminal(`✓ ${filename}`, 'ok');
      showToast('ok', t('diagramExported'));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthFailure();
        return;
      }
      showToast('error', err.message);
    }
  }

  function handleImportFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result || ''));
      setDirty(true);
      setDiagramId(null);
      setTitle(file.name);
      appendTerminal(`> import ${file.name}`, 'ok');
      showToast('ok', t('diagramImported'));
    };
    reader.readAsText(file);
  }

  function handleSelectTemplate(key) {
    setSelectedTemplateKey(key);
  }

  function handleInsertTemplate() {
    const template = findTemplate(selectedTemplateKey);
    if (!template || !template.enabled) {
      return;
    }
    setCode(template.template);
    setNotationKey(template.key === 'none' ? notationKey : template.key);
    setDiagramId(null);
    setTitle(DEFAULT_TITLE);
    setDirty(true);
    setSvg(null);
    setIssues([]);
  }

  async function handleSelectFile(file) {
    try {
      const detail = await diagramsApi.getDiagram(file.id, token);
      setCode(detail.current_dsl_content || '');
      setDiagramId(detail.id);
      setTitle(`${detail.title}.dsl`);
      setNotationKey(detail.notation);
      setSelectedTemplateKey(detail.notation);
      setDirty(false);
      setSaveFailed(false);
      setSvg(null);
      setIssues([]);
      appendTerminal(`> GET /api/v1/diagrams/${detail.id}`, 'ok');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthFailure();
        return;
      }
      showToast('error', err.message);
    }
  }

  function handleZoomIn() {
    setZoomPercent((value) => Math.min(200, value + 10));
  }

  function handleZoomOut() {
    setZoomPercent((value) => Math.max(25, value - 10));
  }

  function handleFit() {
    setZoomPercent(100);
  }

  const enabledTemplates = NOTATION_TEMPLATES.filter((tpl) => tpl.enabled && tpl.key !== 'none');
  const syncStatus = saveFailed ? 'error' : dirty ? 'unsaved' : 'synced';
  const activeTemplateLabel =
    NOTATION_TEMPLATES.find((tpl) => tpl.key === notationKey)?.label || notationKey;
  const userInitials = email ? email.slice(0, 2).toUpperCase() : 'ДК';

  return (
    <div className="ide">
      <Titlebar
        t={t}
        theme={theme}
        onToggleTheme={toggleTheme}
        notationKey={notationKey}
        onNotationChange={setNotationKey}
        enabledTemplates={enabledTemplates}
        title={title}
        onTitleChange={setTitle}
        onRun={handleRun}
        onSave={handleSave}
        onExport={handleExport}
        onImportFile={handleImportFile}
        running={running}
        saving={saving}
        canExport={Boolean(diagramId)}
        userInitials={userInitials}
        onLogout={handleAuthFailure}
      />
      <div className="body-row">
        <ActivityBar soonLabel={t('soon')} />
        <Sidebar
          templates={NOTATION_TEMPLATES}
          templatesFilter={templatesFilter}
          onTemplatesFilterChange={setTemplatesFilter}
          selectedTemplateKey={selectedTemplateKey}
          onSelectTemplate={handleSelectTemplate}
          onInsertTemplate={handleInsertTemplate}
          files={files}
          filesFilter={filesFilter}
          onFilesFilterChange={setFilesFilter}
          onSelectFile={handleSelectFile}
          activeDiagramId={diagramId}
          t={t}
        />
        <div className="split">
          <EditorPane value={code} onChange={handleCodeChange} theme={theme} onCursorChange={setCursorPosition} />
          <CanvasPane
            svg={svg}
            zoomPercent={zoomPercent}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFit={handleFit}
            emptyLabel={t('canvasEmpty')}
          />
        </div>
      </div>
      <BottomPanel
        activeTab={activeBottomTab}
        onSelectTab={setActiveBottomTab}
        terminalLines={terminalLines}
        issues={issues}
        t={t}
      />
      <StatusBar
        syncStatus={syncStatus}
        notationLabel={activeTemplateLabel}
        cursorPosition={cursorPosition}
        locale={locale}
        onToggleLocale={toggleLocale}
        t={t}
      />
      <Toast toast={toast} />
    </div>
  );
}

export default IdePage;
