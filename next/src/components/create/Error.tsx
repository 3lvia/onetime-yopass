import { useTranslation } from 'react-i18next';
import { Container, Typography } from '@mui/material';

const styles = { paddingTop: 1, paddingBottom: 1 };

const ErrorPage = (props: { error?: Error }) => {
  const { t } = useTranslation();
  if (!props.error) {
    return null;
  }

  return (
    <Container>
      <Typography variant="h4">{t('error.title')}</Typography>
      <Typography variant="h5" sx={{ paddingBottom: 1 }}>
        {t('error.subtitle')}
      </Typography>

      <Typography sx={styles} variant="h5">
        {t('error.titleOpened')}
      </Typography>
      <Typography variant="subtitle1">
        {t('error.subtitleOpenedBefore')}
        <br />
        {t('error.subtitleOpenedCompromised')}
        <Typography sx={styles} variant="h5">
          {t('error.titleBrokenLink')}
        </Typography>
        {t('error.subtitleBrokenLink')}
        <Typography sx={styles} variant="h5">
          {t('error.titleExpired')}
        </Typography>
        {t('error.subtitleExpired')}
      </Typography>
    </Container>
  );
};
export default ErrorPage;
