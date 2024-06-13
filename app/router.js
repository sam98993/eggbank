/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/login', controller.users.login);
  router.post('/loginCheck', controller.users.loginCheck);
  router.get('/register', controller.users.register);
  router.post('/registerCheck', controller.users.registerCheck);
  router.post('/bank', controller.bank.bank);
  router.get('/withdraw/:uid/:mode', controller.bank.transaction);
  router.get('/deposit/:uid/:mode', controller.bank.transaction);
  router.get('/searchByUserId/:uid/:mode', controller.summaries.searchByUserId);
  router.post('/search', controller.summaries.search);
  router.post('/result/:mode', controller.bank.result);
};
