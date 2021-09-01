import { useTranslation } from 'react-i18next';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    font: "Red Hat Display, sans-serif"
  },
  text: {
    font: "Red Hat Text, sans-serif"
  }
}));

const ErrorPage = (props: { error?: Error }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  if (!props.error) {
    return null;
  }

  return (
    <div>
      <Typography
        variant="h4"
        style={{ fontFamily: "Red Hat Display, sans-serif" }}>
        {t('Secret Does Not Exist')}
      </Typography>
      <Typography
        className={classes.header}
        variant="h5">
        {t('Secret may be inaccessible due to the following reasons.')}
      </Typography>
      <br />

      <Typography
        className={classes.header}
        variant="h5">
        • {t('Already Retrieved')}
      </Typography>
      <Typography
        variant="subtitle1"
        className={classes.text}>
        {t(
          'A secret can be restricted to a single download. It might be lost because the sender clicked this link before you viewed it.',
        )}
        <br />
        {t(
          'The secret might have been compromised and read by someone else. You should contact the sender and request a new secret.',
        )}

        <Typography
          className={classes.header}
          variant="h5">
          • {t('Broken Link')}
        </Typography>
        {t(
          'The link must match perfectly in order for the decryption to work, it might be missing some magic digits.',
        )}

        <Typography
        className={classes.header}
        variant="h5">
          • {t('Expired')}
        </Typography>
        {t(
          'No secret last forever. All stored secrets will expires and self destruct automatically. Lifetime varies from one hour up to one week.',
        )}
      </Typography>
    </div>
  );
};
export default ErrorPage;
