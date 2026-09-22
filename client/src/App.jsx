import { useState } from 'react';
import { DiagramDetail } from './components/DiagramDetail.jsx';
import { DiagramForm } from './components/DiagramForm.jsx';
import { DiagramList } from './components/DiagramList.jsx';
import { LoginForm } from './components/LoginForm.jsx';
import { RegisterForm } from './components/RegisterForm.jsx';
import { getToken, clearToken } from './auth/token.js';
import { DiagramsProvider, useDiagrams } from './context/DiagramsContext.jsx';
import './index.css';

function DiagramsApp({ onLogout }) {
  const { diagrams, addDiagram, editDiagram } = useDiagrams();
  const [screen, setScreen] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  function showList() {
    setScreen('list');
    setSelectedId(null);
  }

  function showDetail(id) {
    setSelectedId(id);
    setScreen('detail');
  }

  function showCreate() {
    setScreen('create');
  }

  function showEdit(id) {
    setSelectedId(id);
    setScreen('edit');
  }

  return (
    <div>
      <nav className="app-nav">
        <a onClick={showList} role="button" tabIndex={0}>
          Диаграммы
        </a>
        <a onClick={onLogout} role="button" tabIndex={0}>
          Выйти
        </a>
      </nav>
      {screen === 'list' && <DiagramList onSelect={showDetail} onCreate={showCreate} />}
      {screen === 'detail' && (
        <DiagramDetail id={selectedId} onEdit={showEdit} onBack={showList} />
      )}
      {screen === 'create' && (
        <DiagramForm
          onSubmit={async (values) => {
            await addDiagram(values);
            showList();
          }}
          onCancel={showList}
        />
      )}
      {screen === 'edit' && (
        <DiagramForm
          initialValues={diagrams.find((d) => d.id === selectedId) ?? null}
          onSubmit={async (values) => {
            await editDiagram(selectedId, values);
            showDetail(selectedId);
          }}
          onCancel={() => showDetail(selectedId)}
        />
      )}
    </div>
  );
}

function App() {
  const [authScreen, setAuthScreen] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));

  function handleLogout() {
    clearToken();
    setIsAuthenticated(false);
    setAuthScreen('login');
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1>DiagramCode</h1>
        {authScreen === 'login' ? (
          <LoginForm onSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <RegisterForm onSuccess={() => setAuthScreen('login')} />
        )}
        <button
          type="button"
          onClick={() => setAuthScreen(authScreen === 'login' ? 'register' : 'login')}
        >
          {authScreen === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    );
  }

  return (
    <DiagramsProvider>
      <DiagramsApp onLogout={handleLogout} />
    </DiagramsProvider>
  );
}

export default App;
