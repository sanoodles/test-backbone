$(function () {





    /**
     * @section Model
     */

    var Article = Backbone.Model.extend({
        paramRoot: 'article',
        defaults: {
            title: "(empty title)",
            author: "(empty author)",
            content: "(empty content)",
        },
        initialize: function () {
            if (!this.get("content")) {
                this.set({"content": this.defaults.content});
            }
        },
        clear: function () {
            this.destroy();
        }
    });





    /**
     * @section Collection
     */

    var ArticleList = Backbone.Collection.extend({
        url: 'articles.api',
        model: Article,

        /*
         * We keep the Articles in sequential order, despite being saved by unordered
         * GUID in the database. This generates the next order number for new items.
         */
        nextOrder: function () {
            if (!this.length) return 1;
            return parseInt(this.last().get('order')) + 1;
        },

        // Articles are sorted by their original insertion order.
        comparator: function (article) {
            return article.get('order');
        }
    });

    var Articles = new ArticleList;





    /**
     * @section View
     */

    var ArticleView = Backbone.View.extend({

        tagName:  "div",

        template: _.template($('#article-template').html()),

        events: {
            "dblclick label.article-title"    : "edit",
            "dblclick label.article-author"   : "edit",
            "dblclick label.article-content"  : "edit",
            "click .article-destroy"          : "clear",
            "keypress .title-input"           : "updateOnEnter",
            "keypress .author-input"          : "updateOnEnter",
            "keypress .content-input"         : "updateOnEnter"
        },

        /*
         * The ArticleView listens for changes to its model, re-rendering. Since there's
         * a one-to-one correspondence between a **Article** and a **ArticleView** in this
         * app, we set a direct reference on the model for convenience.
         * @see http://underscorejs.org/#bindAll
         */
        initialize: function () {
            _.bindAll(this, 'render', 'close', 'remove');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.remove);
        },

        render: function () {
            $(this.el).html(this.template(this.model.toJSON()));
            this.title = this.$('.title-input');
            this.author = this.$('.author-input');
            this.content = this.$('.content-input');
            return this;
        },

        // Switch this view into "editing" mode, displaying the input field.
        edit: function () {
            $(this.el).addClass("editing");
            this.content.focus();
        },

        // Close the "editing" mode, saving changes to the article.
        close: function () {
            this.model.save({
                title: this.title.val(),
                author: this.author.val(),
                content: this.content.val(),
            });
            $(this.el).removeClass("editing");
        },

        // Pressing enter closes the "editing" mode.
        updateOnEnter: function (e) {
            if (e.keyCode === 13) this.close();
        },

        // Remove the article, destroy the model.
        clear: function () {
            this.model.clear();
        }

    });





    // Our overall **AppView** is the top-level piece of UI.
    var AppView = Backbone.View.extend({

        /*
         * Instead of generating a new element, bind to the existing skeleton of
         * the App already present in the HTML.
         */
        el: $("#app"),

        events: {
            "click #create" : "create",
        },

        /*
         * At initialization we bind to the relevant events on the "Articles"
         * collection, when items are added or changed. Kick things off by
         * loading any preexisting articles that might be saved.
         */
        initialize: function () {
            _.bindAll(this, 'addOne', 'addAll');

            this.title = this.$("#new-title");
            this.author = this.$("#new-author");
            this.content = this.$("#new-content");

            Articles.bind('add',   this.addOne);
            Articles.bind('reset', this.addAll);
            Articles.bind('all',   this.render);

            Articles.fetch();
        },

        /*
         * Add a single article item to the list by creating a view for it, and
         * appending its element to the "articles" div.
         */
        addOne: function (article) {
            var view = new ArticleView({model: article});
            this.$("#articles").append(view.render().el);
        },

        // Add all items in the Articles collection at once.
        addAll: function () {
            Articles.each(this.addOne);
        },

        // Generate the attributes for a new Article item.
        newAttributes: function () {
            return {
                title: this.title.val(),
                author: this.author.val(),
                content: this.content.val(),
                order: Articles.nextOrder(),
            };
        },

        create: function (e) {
            Articles.create(this.newAttributes());
            this.title.val('');
            this.author.val('');
            this.content.val('');
        },

    });

    var App = new AppView;





});
