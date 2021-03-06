"use strict";
var utils = require("hornet-js-utils");
var React = require("react");
var HornetComponentMixin = require("hornet-js-core/src/mixins/react-mixins");

var logger = utils.getLogger("hornet-js-components.table.table-tools-action-pagination");

module.exports = React.createClass({
    mixins: [HornetComponentMixin],

    propTypes: {
        tableName: React.PropTypes.string,
        options: React.PropTypes.object,
        /** Libellés surchargeant les libellés du composant table */
        messages: React.PropTypes.object,
        pagination: React.PropTypes.object,
        onchangePaginationData: React.PropTypes.func,
        classAction: React.PropTypes.string,

        enabled: React.PropTypes.bool,
        /** Choix de taille de page proposés */
        pageSizeSelect: React.PropTypes.arrayOf(React.PropTypes.shape({
            /** Taille de page */
            value: React.PropTypes.number.isRequired,
            /** Clé du libellé à rechercher dans messages ou dans le bloc de messages du composant "table" */
            textKey: React.PropTypes.string.isRequired
        })),
        /** Path permettant de surcharger les pictogrammes/images **/
        imgFilePath: React.PropTypes.string,
        actions: React.PropTypes.object,
        routes: React.PropTypes.object,
        openDeleteAlert: React.PropTypes.func,
        actionMassEnabled: React.PropTypes.bool,
        actionAddEnabled: React.PropTypes.bool,
        actionPaginationEnabled: React.PropTypes.bool
    },

    getDefaultProps: function () {
        return {
            enabled: false,
            pageSizeSelect : [
                {value: 10, textKey: "10"},
                {value: 50, textKey: "50"},
                {value: 100, textKey: "100"},
                {value: -1, textKey: "displayAll"}
            ],
            messages: {}
        };
    },

    getInitialState: function () {
        return {
            /* Libellés du composant table */
            i18n: this.i18n("table")
        };
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        logger.trace("shouldComponentUpdate");

        return this.props.enabled !== nextProps.enabled
            || this.props.pagination.pageIndex !== nextProps.pagination.pageIndex
            || this.props.pagination.itemsPerPage !== nextProps.pagination.itemsPerPage
            || this.props.pagination.totalItems !== nextProps.pagination.totalItems;
    },

    render: function () {
        logger.trace("render");
        try {
            var classAction = "hornet-datatable-pagination " + this.props.classAction;
            return (
                (this.props.enabled) ?
                    <div className={classAction}>
                        <div className="pure-g">
                            <div className="hornet-datatable-pagination-controls pure-u-1-3">
                                {this._getButtons()}
                            </div>
                            {this._renderSelectIndexPage()}
                            {this._renderSelectItemsPerPage(this.props.pageSizeSelect)}
                        </div>
                    </div> : null
            );
        } catch (e) {
            logger.error("Render table-tools-action-pagination exception", e);
            throw e;
        }
    },

    /**
     * Rendu HTML du composant Select ItemsPerPage
     * @returns {XML}
     */
    _renderSelectItemsPerPage: function (pageSizeSelect) {
        logger.trace("_renderSelectItemsPerPage");

        var labelForSelectItemsPerPage = this.props.tableName + "itemsPerPage";

        var options = [];
        pageSizeSelect.map((item) => {
            options.push(
                <option
                    value={item.value}
                    key={"selectedItems-"+item.value+"-"+item.textKey}
                    selected={this.props.pagination.itemsPerPage == item.value}
                    >
                    {this.props.messages[item.textKey] || this.state.i18n[item.textKey] || item.textKey}
                </option>
            );
        });
        var itemPerPageValue = this.props.pagination.itemsPerPage.toString();
        return (
            <div className="hornet-datatable-pagination-select-index pure-u-1-3">
                <label htmlFor={labelForSelectItemsPerPage}>
                    {this.props.messages.rowNumber || this.state.i18n.rowNumber}
                </label>
                <select name={labelForSelectItemsPerPage} onChange={this.onFormChange} value={itemPerPageValue}>
                    {options}
                </select>
            </div>

        );
    },

    /**
     * Rendu HTML du composant Select indexPage
     * @returns {XML}
     */
    _renderSelectIndexPage: function () {
        logger.trace("_renderSelectIndexPage");

        var options = [];
        var totalPages = this._getTotalPages() || 1;
        for (var i = 1; i <= totalPages; i++) {
            options.push(<option value={i} key={"indexPage-"+i}>{i}</option>);
        }
        return (
            <div className="hornet-datatable-pagination-per-page pure-u-1-3">
                <label>
                    {this.props.messages.pageFooter || this.state.i18n.pageFooter}
                </label>
                <select name="indexPage" onChange={this.onFormChange} value={this.props.pagination.pageIndex}>
                    {options}
                </select>
                &nbsp;/&nbsp;{totalPages}
            </div>
        );
    },

    _getTotalPages: function () {
        return (this.props.pagination.itemsPerPage === -1) ?
            1 : //cas du "tout"
            Math.ceil(this.props.pagination.totalItems / this.props.pagination.itemsPerPage);
    },

    /**
     * Méthode permettant de générer le code HTML lié aux boutons
     * @returns {*}
     * @private
     */
    _getButtons: function () {
        logger.trace("_getButtons");

        var firstPage, prevPage, nextPage, lastPage;
        firstPage = prevPage = nextPage = lastPage = 1;

        var disabledClass = "hornet-datatable-pagination-control-disabled";
        var enabledClass = "hornet-datatable-pagination-control-enabled";

        var firstClass, prevClass, nextClass, lastClass;
        firstClass = prevClass = nextClass = lastClass = disabledClass;

        //calcul du nombre de pages
        var {totalItems, itemsPerPage, pageIndex} = this.props.pagination;
        var totalPages = this._getTotalPages();

        //cas d'un nouvelle recherche quand on est positionné sur la dernière pagination et que le total est inférieur
        // à l'ancienne recherche
        if (pageIndex > totalPages) {
            pageIndex = 1;
        }
        var testPageIndex = (totalItems > itemsPerPage && totalPages > 1);

        var startOnClickActif, EndOnClickActif;
        if (testPageIndex) {
            if (pageIndex > 1) {
                prevPage = pageIndex - 1;
                firstClass = enabledClass;
                prevClass = enabledClass;
                startOnClickActif = true;
            }

            if (pageIndex < totalPages) {
                lastPage = totalPages;
                nextPage = pageIndex + 1;
                nextClass = enabledClass;
                lastClass = enabledClass;
                EndOnClickActif = true;
            }
        }
        return [
            this._renderButton(this.props.messages.firstPage || this.state.i18n.firstPage, firstPage, firstClass, startOnClickActif, "first"),
            this._renderButton(this.props.messages.prevPage || this.state.i18n.prevPage, prevPage, prevClass, startOnClickActif, "prev"),
            this._renderButton(this.props.messages.nextPage || this.state.i18n.nextPage, nextPage, nextClass, EndOnClickActif, "next"),
            this._renderButton(this.props.messages.lastPage || this.state.i18n.lastPage, lastPage, lastClass, EndOnClickActif, "last")
        ];
    },

    /**
     * Méthode permettant de générer le bloc HTML lié aux boutons
     * @param texte
     * @param page
     * @param className
     * @param type
     * @returns {XML}
     */
    _renderButton: function (texte, page, className, onClickActif, type) {
        logger.trace("_renderButton");
        className += " hornet-datatable-pagination-control hornet-datatable-pagination-control-" + type;

        var changePaginationFunction = null,
            self = this;
        if(onClickActif) {
            changePaginationFunction = function () {
                self._onChangePagination(page, self.props.pagination.itemsPerPage);
            }
        }

        return (
            <button
                data-type={type}
                className={className}
                onClick={(onClickActif)? changePaginationFunction : null}
                data-page={page}
                key={"buttonPagination-"+type}
            >
                {texte}
            </button>
        );
    },

    /**
     * Evènement déclenché lors d'un clic sur l'un des 4 boutons de pagination
     * @param pageIndex
     * @param itemsPerPage
     * @private
     */
    _onChangePagination: function (pageIndex, itemsPerPage) {
        logger.trace("_onChangePagination");

        this.props.onchangePaginationData({
            pageIndex: pageIndex || 1,
            itemsPerPage: itemsPerPage || this.props.pagination.itemsPerPage,
            totalItems: this.props.pagination.totalItems
        });
    },

    /**
     * Méthode permettant de déctecter un changement d'état de la pagination
     * @param e
     */
    onFormChange: function (e) {
        logger.trace("onFormChange");

        var pageIndex;
        var itemsPerPage;

        if (this.props.pagination.totalItems) {
            if (e.target.name == "indexPage") {
                pageIndex = parseInt(e.target.value);
            } else {
                itemsPerPage = parseInt(e.target.value);
            }
            this._onChangePagination(pageIndex, itemsPerPage);
        }
    }
});