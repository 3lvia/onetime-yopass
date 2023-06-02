import { AppBar, Toolbar, Typography, Button, Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isOnUploadPage = location.pathname.includes('upload');
  const isOnCreatePage = location.pathname.includes('create');
  // const base = process.env.PUBLIC_URL || '';
  const home = '/';
  const upload = '/upload';
  const create = '/create';

  var WebFont = require('webfontloader');

  const currentLocationHref = window.location.href; // returns the absolute URL of a page
  console.log('window.location.href: ' + currentLocationHref);
  const currentLocationPathname = window.location.pathname; //returns the current url minus the domain name
  console.log('window.location.pathname: ' + currentLocationPathname);

  WebFont.load({
    google: {
      families: ['Red Hat Display', 'Red Hat Text', 'Ubuntu'],
    },
  });

  return (
    <AppBar position="static" color="transparent">
      <Toolbar>
        <Link href={home} color="inherit" underline="none">
          <Typography variant="h6" component="div">
            <img
              data-test-id="headerIconImage"
              width="80"
              height="40"
              alt=""
              src="elvia_logo.svg"
            />
          </Typography>
        </Link>
        <Link href={home} color="inherit" underline="none">
          <Typography
            data-test-id="headerDescription"
            style={{ fontFamily: 'Red Hat Display, sans-serif' }}
          >
            {' Share Secrets Securely'}
          </Typography>
        </Link>
        <Box
          sx={{
            marginLeft: 'auto',
            padding: '1em',
            display: 'flex',
          }}
        >
          <Button
            data-test-id="createButton"
            // disabled={isOnCreatePage ? true : false}
            component={RouterLink}
            to={isOnCreatePage ? home : create}
            variant="contained"
            color="primary"
            style={{
              fontFamily: 'Red Hat Display, sans-serif',
              marginLeft: '1rem',
            }}
          >
            {isOnCreatePage ? t('header.buttonHome') : t('header.buttonCreate')}
          </Button>

          <Button
            data-test-id="uploadButton"
            // disabled={isOnUploadPage ? true : false}
            component={RouterLink}
            to={isOnUploadPage ? home : upload}
            variant="contained"
            color="primary"
            style={{
              fontFamily: 'Red Hat Display, sans-serif',
              marginLeft: '1rem',
            }}
          >
            {isOnUploadPage ? t('header.buttonHome') : t('header.buttonUpload')}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
