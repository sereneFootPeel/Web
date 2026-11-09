import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export function Home() {
  const { t } = useLanguage()

  return (
    <Link to="/philosophers" className="sr-only">
      {t('进入馆藏', 'Enter the archive')}
    </Link>
  )
}
