import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as firebase from 'firebase-admin';
import * as serviceAccount from './auth/service-account.json';

const firebaseParams = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

async function bootstrap() {
  firebase.initializeApp({
    credential: firebase.credential.cert(firebaseParams),
  });
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'HEAD,OPTIONS,GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: '*',
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 204,
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
