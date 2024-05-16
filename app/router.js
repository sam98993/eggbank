/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/login', controller.users.login);
  router.post('/loginCheck', controller.users.check);
  router.post('/bank', controller.users.bank);
  router.get('/withdraw/:uid', controller.users.withdraw);
  router.get('/deposit/:uid', controller.users.deposit);
  router.post('/result/:mode', controller.users.result);
};