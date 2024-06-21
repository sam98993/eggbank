/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  router.get('/login', controller.users.renderLoginPage)
  router.post('/checkLogin', controller.users.checkLogin)
  router.get('/register', controller.users.renderRegisterPage)
  router.post('/checkRegister', controller.users.checkRegister)
  router.post('/bank', controller.bank.renderHomepage)
  router.get('/withdraw/:uid/:mode', controller.bank.renderTransactionPage)
  router.get('/deposit/:uid/:mode', controller.bank.renderTransactionPage)
  router.get('/setSearchingConditions/:uid/:mode', controller.summaries.renderSetSearchingConditionsPage)
  router.post('/searchResults', controller.summaries.sendSearchResults)
  router.post('/result/:mode', controller.bank.calculateResult)
}
