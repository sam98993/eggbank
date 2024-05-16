// This file is created by egg-ts-helper@2.1.0
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportConclude = require('../../../app/controller/conclude');
import ExportLogin = require('../../../app/controller/login');
import ExportLoginCheck = require('../../../app/controller/loginCheck');
import ExportMoney = require('../../../app/controller/money');
import ExportMoney1 = require('../../../app/controller/money1');
import ExportMoney2 = require('../../../app/controller/money2');

declare module 'egg' {
  interface IController {
    conclude: ExportConclude;
    login: ExportLogin;
    loginCheck: ExportLoginCheck;
    money: ExportMoney;
    money1: ExportMoney1;
    money2: ExportMoney2;
  }
}
