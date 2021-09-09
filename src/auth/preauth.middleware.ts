import * as firebase from 'firebase-admin';
import * as serviceAccount from './service-account.json';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';

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

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
  private firebaseApp: firebase.app.App;

  constructor() {
    this.firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebaseParams),
    });
  }

  use(req: any, res: any, next: () => void) {
    const token = req.headers.authorization;
    const isSocialHeader = req.headers['x-social'];
    const isSocialAuth =
      isSocialHeader !== undefined &&
      isSocialHeader !== null &&
      isSocialHeader === 'true';

    if (isSocialAuth && token !== undefined && token !== null && token !== '') {
      this.firebaseApp
        .auth()
        .verifyIdToken(token.replace('Bearer', '').trim())
        .then(async (decodedToken) => {
          const user = {
            email: decodedToken.email,
            uid: decodedToken.uid,
          };
          req['user'] = user;
          console.log(user);
          next();
        })
        .catch((error) => {
          console.error(error);
          this.accessDenied(req.url, res);
        });
    } else {
      next();
    }
  }

  private accessDenied(url: string, res: Response) {
    res.status(401).json({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }
}
