import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { isValidEmail } from '../auth/validation.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { BrandLogo } from '../components/shared/BrandLogo.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  function validate() {
    const errors = {};
    if (!email.trim()) {
      errors.email = t('errorRequired');
    } else if (!isValidEmail(email)) {
      errors.email = t('errorEmail');
    }
    if (!password) {
      errors.password = t('errorRequired');
    }
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setPending(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || t('errorRequired'));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-app">
      <div className="auth-card">
        <div className="auth-brand">
          <BrandLogo />
          {t('loginTitle')}
        </div>
        <div className="auth-sub">{t('loginSubtitle')}</div>
        {formError ? <div className="form-err">{formError}</div> : null}
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">{t('emailLabel')}</label>
            <input
              id="login-email"
              className={`auth-input${fieldErrors.email ? ' err' : ''}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            {fieldErrors.email ? <div className="hint-err">{fieldErrors.email}</div> : null}
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">{t('passwordLabel')}</label>
            <input
              id="login-password"
              className={`auth-input${fieldErrors.password ? ' err' : ''}`}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            {fieldErrors.password ? <div className="hint-err">{fieldErrors.password}</div> : null}
          </div>
          <button className="auth-submit" type="submit" disabled={pending}>
            {pending ? t('loginButtonPending') : t('loginButton')}
          </button>
        </form>
        <div className="auth-foot">
          {t('noAccount')} <Link to="/register">{t('registerLink')}</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
