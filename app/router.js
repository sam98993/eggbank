/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/login', controller.login.list);
  router.post('/loginCheck', controller.loginCheck.list);
  router.post('/money', controller.money.list);
  router.get('/money1/:uid', controller.money1.list);
  router.get('/money2/:uid', controller.money2.list);
  router.post('/conclude/:mode', controller.conclude.list);
};
