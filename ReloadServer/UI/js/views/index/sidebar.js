define([
    'jquery',
    'underscore',
    'backbone',
    'views/index/sidebar_reload_button',
    'views/index/sidebar_controls',
    'views/index/sidebar_left_foot',
    'views/project/list',
    'collections/projects',
    'views/index/statistics_dialog',
    'models/index/statistics',
    'text!../../../templates/index/sidebar.html'
], function($, _, Backbone,
            SidebarReloadButtonView,
            SidebarControls,
            SidebarLeftFootView,
            ProjectListView,
            ProjectCollection,
            StatisticsDialog,
            StatisticsModel,
            sidebarTemplate){

    var SidebarView = Backbone.View.extend({

        debug: false,
        selectedProject: null,
        deviceCount: 0,
        views: null,

        initialize: function (options) {
            this.views = options.views;

            _.bindAll(this,
                      'render',
                      'changePath'
                     );

            this.collection = new ProjectCollection();
            this.collection.on('change:path', this.changePath);

            this.model = new StatisticsModel();
        },

        render: function () {

            var compiledTemplate = _.template( sidebarTemplate, {} );
            this.$el.html( compiledTemplate );

            var sidebarReloadButtonView = new SidebarReloadButtonView({
                parent: this
            });
            this.$el.append( sidebarReloadButtonView.render() );

            var sidebarControls = new SidebarControls({
                projectList: this.collection
            });
            this.$el.append( sidebarControls.render() );

            this.projectListView = new ProjectListView({
                projectList: this.collection,
                parent: this
            });
            this.$el.append( this.projectListView.render() );

            var sidebarLeftFootView = new SidebarLeftFootView( {parent: this} );
            this.$el.append( sidebarLeftFootView.render() );

            var statisticsDialog = new StatisticsDialog();
            statisticsDialog.render();

            return this.$el;
        },

        close: function () {

            this.projectListView.close();

            //COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();
            this.$el.removeData().unbind();

            //Remove view from DOM
            this.remove();
            Backbone.View.prototype.remove.call(this);
        },

        changePath: function () {

            // TODO: Update only if path has changed.
            var options     = {};
            options.url     = 'http://localhost:8283';
            options.rpcMsg  = {
                method: 'manager.changeWorkspacePath',
                params: [this.collection.path],
                id: null
            };

            var self = this;
            options.success = function (resp) {
                console.log('RPC success, Changed workspace to: ' + resp.result);
                self.collection.rePopulate();
            };

            options.error   = function (resp) {
                //console.log('could not change workspace path');
                console.log(resp);
            };

            this.collection.rpc(options);
        }
    });

    return SidebarView;
});


