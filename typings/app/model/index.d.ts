// This file is created by egg-ts-helper@2.1.0
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportUsers = require('../../../app/model/users');

declare module 'egg' {
  interface IModel {
    Users: ReturnType<typeof ExportUsers>;
  }
}
