import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { isValidEmail } from '../auth/validation.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { BrandLogo } from '../components/shared/BrandLogo.jsx';

export function RegisterPage() {
  const { register, login } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  function validate() {
    const errors = {};
    if (!username.trim()) {
      errors.username = t('errorRequired');
    }
    if (!email.trim()) {
      errors.email = t('errorRequired');
    } else if (!isValidEmail(email)) {
      errors.email = t('errorEmail');
    }
    if (!password) {
      errors.password = t('errorRequired');
    }
    if (!confirmPassword) {
      errors.confirmPassword = t('errorRequired');
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t('errorPasswordMatch');
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
      await register(username, email, password);
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
        <div className="auth-sub">{t('registerSubtitle')}</div>
        {formError ? <div className="form-err">{formError}</div> : null}
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="register-username">{t('usernameLabel')}</label>
            <input
              id="register-username"
              className={`auth-input${fieldErrors.username ? ' err' : ''}`}
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
            {fieldErrors.username ? <div className="hint-err">{fieldErrors.username}</div> : null}
          </div>
          <div className="auth-field">
            <label htmlFor="register-email">{t('emailLabel')}</label>
            <input
              id="register-email"
              className={`auth-input${fieldErrors.email ? ' err' : ''}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            {fieldErrors.email ? <div className="hint-err">{fieldErrors.email}</div> : null}
          </div>
          <div className="auth-row2">
            <div className="auth-field">
              <label htmlFor="register-password">{t('passwordLabel')}</label>
              <input
                id="register-password"
                className={`auth-input${fieldErrors.password ? ' err' : ''}`}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.password ? <div className="hint-err">{fieldErrors.password}</div> : null}
            </div>
            <div className="auth-field">
              <label htmlFor="register-confirm-password">{t('confirmPasswordLabel')}</label>
              <input
                id="register-confirm-password"
                className={`auth-input${fieldErrors.confirmPassword ? ' err' : ''}`}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword ? (
                <div className="hint-err">{fieldErrors.confirmPassword}</div>
              ) : null}
            </div>
          </div>
          <button className="auth-submit" type="submit" disabled={pending}>
            {pending ? t('registerButtonPending') : t('registerButton')}
          </button>
        </form>
        <div className="auth-foot">
          {t('haveAccount')} <Link to="/login">{t('loginLink')}</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
