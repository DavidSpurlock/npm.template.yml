/* @ngInject */
function mxModal(dispatchers, pmModal) {
    return pmModal({
        controllerAs: 'ctrl',
        templateUrl: require('../../../templates/modals/domain/mx.tpl.html'),
        /* @ngInject */
        controller: function(params) {
            const { dispatcher } = dispatchers(['domainModal']);

            this.domain = params.domain;
            this.step = params.step;
            this.open = (type) => dispatcher.domainModal(type, { domain: params.domain });
            this.next = () => {
                params.next();
            };
            this.close = () => {
                params.close();
            };
        }
    });
}
export default mxModal;
