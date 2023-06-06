import { useTranslation } from 'react-i18next';
import { useForm, Controller, Control } from 'react-hook-form';
import randomString, { encryptMessage, postSecret } from '../utils/utils';
import { useState } from 'react';
import Result from '../displaySecret/Result';
import Expiration from './../shared/Expiration';
import {
  Alert,
  TextField,
  Typography,
  Button,
  Grid,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useAuth } from 'oidc-react';

const CreateSecret = () => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      generateDecryptionKey: true,
      secret: '',
      onetime: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    password: '',
    uuid: '',
  });

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.ctrlKey && event.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (form: any): Promise<void> => {
    // Use the manually entered password, or generate one
    const pw = randomString();
    setLoading(true);
    try {
      const { data, status } = await postSecret({
        expiration: parseInt(form.expiration),
        message: await encryptMessage(form.secret, pw),
        one_time: true,
        access_token: auth?.userData?.access_token,
      });

      if (status !== 200) {
        setError('secret', { type: 'submit', message: data.message });
      } else {
        setResult({
          password: pw,
          uuid: data.message,
        });
      }
    } catch (e: any) {
      setError('secret', { type: 'submit', message: e.message });
    }
    setLoading(false);
  };

  var auth = useAuth();

  if (result.uuid) {
    return <Result password={result.password} uuid={result.uuid} prefix="s" />;
  }

  return (
    <>
      <Error
        message={errors.secret?.message}
        onClick={() => clearErrors('secret')}
      />
      <Typography component="h1" variant="h4" align="center">
        {t('create.title')}
      </Typography>

      <Typography
        data-test-id="userEmail"
        align="center"
        style={{
          fontFamily: 'Red Hat Text, sans-serif',
          padding: '.5em 0em',
        }}
      >
        {auth.userData?.profile.email}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container justifyContent="center" paddingTop={1}>
          <Controller
            name="secret"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline={true}
                margin="dense"
                fullWidth
                label={t('create.inputSecretLabel')}
                rows="4"
                autoFocus={true}
                onKeyDown={onKeyDown}
                placeholder={t<string>('create.inputSecretPlaceholder')}
                inputProps={{ spellCheck: 'false', 'data-gramm': 'false' }}
              />
            )}
          />
          <Grid container justifyContent="center" marginTop={2}>
            <Expiration control={control} />
          </Grid>
          <Grid container justifyContent="center">
            <Box p={2} pb={4}>
              <Button
                onClick={() => handleSubmit(onSubmit)()}
                variant="contained"
                disabled={loading}
              >
                {loading ? (
                  <span>{t('create.buttonEncryptLoading')}</span>
                ) : (
                  <span>{t('create.buttonEncrypt')}</span>
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export const Error = (props: { message?: string; onClick?: () => void }) =>
  props.message ? (
    <Alert severity="error" {...props}>
      {props.message}
    </Alert>
  ) : null;

export const OneTime = (props: { control: Control<any> }) => {
  const { t } = useTranslation();

  return (
    <Grid item justifyContent="center">
      <FormControlLabel
        control={
          <Controller
            name="onetime"
            control={props.control}
            render={({ field }) => (
              <Checkbox
                {...field}
                id="enable-onetime"
                defaultChecked={true}
                color="primary"
              />
            )}
          />
        }
        label={t('create.inputOneTimeLabel') as string}
      />
    </Grid>
  );
};

export default CreateSecret;
