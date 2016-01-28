Backbone.View.prototype.close = function () {
    //console.log('Closing view ', this);
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.undelegateEvents();
    this.remove();
    this.unbind();
};

var AppRouter = Backbone.Router.extend({
    initialize: function() {
        this.GameList = new GameCollection();
        this.RunList = new RunCollection({ });
        this.UsersList = new UserCollection({ });
        this.Response = new ResponseCollection();
        this.ActivityList = new ActivityCollection({ });
        this.GameAccessList = new GameAccessCollection();
        this.RunAccessList = new RunByGameCollection({ });
    },
    routes: {
        ""			                                        : "showInquiries",
        "logout"			                                : "logout",
        "inquiry/:id"	                                    : "showInquiry",
        "inquiry/edit/:id"	                                : "editInquiry",
        "inquiry/new/"	                                    : "createInquiry",
        "inquiry/:id/phase/:phase"                          : "showPhase",
        "inquiry/:id/phase/:phase/activity/:activity"       : "showActivity",
        "profile"                                           : "personalProfile",
        "profile/:id"                                       : "friendProfile"
    },

    // main views
    showInquiries: function() {

        this.isAuthenticated();
        this.common();
        this.initialGame();
        this.initializeChannelAPI();
        this.changeTitle("List of inquiries");
        this.removeEditButton();
        this.showJoinCreateButton();
        this.breadcrumbManagerSmallHide();

        $(".join-inquiry").click(function(){
            //////////////////////////
            // Obtain the inquiry code
            //////////////////////////
            var _inquiry_code = $("input#inquiry-code").val();

            //console.log(_inquiry_code);

            ///////////////////////
            // Retrieve run by code
            ///////////////////////
            var runObject = new RunByCode();
            runObject.code = _inquiry_code;
            runObject.fetch({
                beforeSend:setHeader,
                success: function (response, results) {

                    //console.log(response, results);

                    var _game_retrieved = results.gameId;
                    var _run_retrieved = results.runId;

                    //////////////////////
                    // Give access to Game
                    //////////////////////
                    var newAccessGame = new GiveAccessToGame();
                    newAccessGame.gameId = _game_retrieved;
                    newAccessGame.accoundId = $.cookie("dojoibl.accountType")+":"+$.cookie("dojoibl.localId");
                    newAccessGame.accessRight = 1;
                    newAccessGame.fetch({ beforeSend:setHeader });

                    /////////////////////
                    // Give access to Run
                    /////////////////////
                    var newAccessRun = new GiveAccessToRun();
                    newAccessRun.runId = _run_retrieved;
                    newAccessRun.accoundId = $.cookie("dojoibl.accountType")+":"+$.cookie("dojoibl.localId");
                    newAccessRun.accessRight = 1;
                    newAccessRun.fetch({ beforeSend:setHeader });

                    ////////////////////
                    // Add user to a run
                    ////////////////////
                    var newUserForRun = new AddUserToRun({
                        runId: _run_retrieved,
                        email: $.cookie("dojoibl.accountType")+":"+$.cookie("dojoibl.localId"),
                        accountType: $.cookie("dojoibl.accountType"),
                        localId: $.cookie("dojoibl.localId"),
                        gameId: _game_retrieved
                    });
                    newUserForRun.save({}, { beforeSend:setHeader });


                    app.navigate('#inquiry/'+_run_retrieved, true);
                }
            });
        });

        $("input#top-search").keyup(function () {
            //split the current value of searchInput
            var data = this.value.split(" ");
            //create a jquery object of the rows
            var jo = $(".row.inquiry").find(".col-lg-3.animated.fadeInUp");
            if (this.value == "") {
                jo.show();
                return;
            }
            //hide all the rows
            jo.hide();

            //Recusively filter the jquery object to get results.
            jo.filter(function (i, v) {
                var $t = $(this);
                for (var d = 0; d < data.length; ++d) {
                    if ($t.is(":contains('" + data[d] + "')")) {
                        return true;
                    }
                }
                return false;
            })
                //show the rows that match.
                .show();
        }).focus(function () {
            this.value = "";
            $(this).css({
                "color": "black"
            });
            $(this).unbind('focus');
        }).css({
            "color": "#C0C0C0"
        });
    },
    showInquiry:function (id) {
        this.isAuthenticated();

        this.secureAccess(id); // TODO still need to do it

        $(".phases-breadcrumb").hide();

        this.createCookie("dojoibl.run", id);

        this.common();
        this.breadcrumbManager(0, "");

        this.initializeChannelAPI();
        this.loadChat();

        this.removeJoinCreateButton();

        this.RunList = new RunCollection({ });
        this.RunList.id = id;

        this.RunList.fetch({
            beforeSend: setHeader,
            success: function (response, results) {

                app.createEditButton(results.gameId);

                app.breadcrumbManagerSmall("#","list of inquiries");
                app.changeTitle(results.game.title);

                //console.log(results);

                $('.row.inquiry').html(new InquiryView({ model: results }).render().el);
                $('.row.inquiry').append(new SideBarView({ }).render().el);

                $(".knob").knob();

                $('.chat-discussion').slimScroll({
                    height: '400px',
                    start: 'bottom',
                    railOpacity: 0.4
                });
            }
        });

        $('.tooltip-demo').tooltip({
            selector: "[data-toggle=tooltip]",
            container: "body"
        });

        /////////////////////////////////////////////////////////////////////////////
        // Hide scroll bar while hovering the chat to make the chat experience easier
        // Avoid undesirable scrolling movements
        /////////////////////////////////////////////////////////////////////////////
        //var b = $('html');
        //$('.direct-chat').hover(function() {
        //    var s = b.scrollTop();
        //    b.css('overflow', 'hidden');
        //    b.scrollTop(s);
        //}, function() {
        //    var s = b.scrollTop();
        //    b.css('overflow', 'auto');
        //    b.scrollTop(s);
        //});


    },
    showPhase: function(id, phase){
        this.isAuthenticated();

        var _self = this;
        var _gameId = id;
        var _phase = phase;
        var _runId = 0;
        var _phaseObject;

        if($.cookie("dojoibl.run")){
            _runId = $.cookie("dojoibl.run");
        }

        this.removeJoinCreateButton();
        this.createEditButton(_gameId);

        this.createCookie("dojoibl.game", _gameId);

        var game = new GameCollection({ });
        game.gameId = _gameId;
        game.fetch({
            beforeSend: setHeader,
            success: function (response, game) {
                console.log();
                app.changeTitle(' <a href="#inquiry/'+_runId+'">'+game.title+'</a> <i class="fa fa-angle-double-right"></i> '+game.phases[_phase-1].title);
            }
        });

        $("#circlemenu li:nth-child("+phase+")").addClass("animated bounceOutUp");
        window.setTimeout(function () {
            app.breadcrumbManager(1, "Data collection");

            app.breadcrumbManagerSmall("#inquiry/"+_runId,"the list of phases");

            $(this).addClass("animated fadeOutUpBig");
            this.ActivityList = new ActivitiesCollection({ });
            this.ActivityList
            this.ActivityList.id = _gameId;
            this.ActivityList.section = phase;

            if($(".col-md-9.wrapper.wrapper-content.animated.fadeInUp").length == 0){
                $(".row.inquiry").append($('<div />', {
                    "class": 'col-md-9 wrapper wrapper-content animated fadeInUp',
                    id: "inquiry-content"
                }));
                $('.row.inquiry').append(new SideBarView({ }).render().el);
                app.initializeChannelAPI();
                app.loadChat();
            }

            $("#inquiry-content").html(new PhaseView().render().el);

            this.ActivityList.fetch({
                beforeSend: setHeader,
                success: function (response, results) {
                    _.each(results.generalItems, function(gi){
                        if(gi.deleted == false){
                            $('.ibox-content > .row.m-t-sm > .list_activities').append(new ActivityBulletView({
                                model: gi,
                                phase: _phase
                            }).render().el);
                        }
                    });
                    $(".knob").knob();
                }
            });
        }, 500);
    },
    showActivity: function(id, phase, activity){
        this.isAuthenticated();
        this.common();

        var _phase = phase;
        var _gameId = id;
        var _runId = 0;
        var _gameObject;

        if($.cookie("dojoibl.run")){
            _runId = $.cookie("dojoibl.run");
        }

        this.createCookie("dojoibl.activity", activity);
        this.createEditButton(_gameId);

        this.removeJoinCreateButton();

        this.loadInquiryUsers(_runId);

        this.breadcrumbManagerSmall("#inquiry/"+_gameId+"/phase/"+_phase,"the list of activities");

        var game = new GameCollection({ });
        game.gameId = _gameId;
        game.fetch({
            beforeSend: setHeader,
            success: function (response, game) {
                console.log();
                _gameObject = game;
            }
        });

        $( ".list_activities li[data='"+activity+"']").addClass("animated bounceOutUp");
        window.setTimeout(function () {

            this.Activity = new ActivityCollection({ });
            this.Activity.id = activity;
            this.Activity.gameId = id;
            this.Activity.section = phase;
            this.Activity.fetch({
                beforeSend: setHeader,
                success: function (response, xhr) {
                    app.changeTitle(' <a href="#inquiry/'+_runId+'">'+_gameObject.title+'</a> <i class="fa fa-angle-double-right"></i> <a href="#inquiry/'+_gameObject.gameId+'/phase/'+_phase+'">'+_gameObject.phases[_phase-1].title+'</a> <i class="fa fa-angle-double-right"></i> '+xhr.name);

                    if($(".col-md-9.wrapper.wrapper-content.animated.fadeInUp").length == 0){
                        $(".row.inquiry").append($('<div />', {
                            "class": 'col-md-9 wrapper wrapper-content animated fadeInUp',
                            id: "inquiry-content"
                            }
                        ));

                        if($(".col-lg-3.wrapper.wrapper-content.small-chat-float").length == 0){
                            $('.row.inquiry').append(new SideBarView({ }).render().el);
                            app.initializeChannelAPI();
                            app.loadChat();
                        }
                    }

                    $("#inquiry-content").html(new ActivityView({ model: xhr }).render().el);

                    $(".knob").knob();

                    if(xhr.type.indexOf("SingleChoiceImageTest") > -1) {
                        //var responses = new ResponseCollection();
                        app.Response.id = _runId;
                        app.Response.itemId = xhr.id;
                        app.Response.fetch({
                            beforeSend: setHeader,
                            success: function(response, xhr){
                                //console.log(xhr, response)
                                new ConceptMapView({ model: xhr }).render().el;
                            }
                        });
                    }else if (xhr.type.indexOf("ScanTag") > -1){
                        console.log("Data collection");
                        new window.ResponseDataCollectionListView({ collection: app.Response, users: app.InquiryUsers, game: _gameId, run: _runId });

                        app.Response.id = _runId;
                        app.Response.itemId = xhr.id;
                        app.Response.fetch({
                            beforeSend: setHeader
                        });
                    }
                    else{
                        //app.Responses = new ResponseCollection();

                        if(xhr.type.indexOf("VideoObject") > -1){
                            //
                            //}else if(xhr.type.indexOf("OpenBadge") > -1) {
                            //
                            //}else if(xhr.type.indexOf("MultipleChoiceImageTest") > -1) {
                            //    new window.ResponseTreeView({ collection: app.Responses });
                        }else{
                            new window.ResponseListView({ collection: app.Response, users: app.InquiryUsers, game: _gameId, run: _runId });
                        }

                        app.Response.id = _runId;
                        app.Response.itemId = xhr.id;
                        app.Response.fetch({
                            beforeSend: setHeader
                        });

                        $('#list_answers').addClass("social-footer");
                        $('#list_answers').append(new ResponseReplyView({}).render().el);

                        $(".previous-activity").click(function(){
                            console.log("previous activity");
                        });

                        $(".next-activity").click(function(){
                            console.log("next activity");
                        });

                        ///////////////////////////////////////////////////////////////////////////
                        // This event should be captured outside to manage the comments in the main
                        // discussion thread
                        ///////////////////////////////////////////////////////////////////////////
                        $(".save[responseid='0']").click(function(){

                            if  ($("textarea[responseid='0']").val() != ""){

                                var newResponse = new Response({ generalItemId: xhr.id, responseValue: $("textarea[responseid='0']").val(), runId: $.cookie("dojoibl.run"), userEmail: 0, parentId: 0 });
                                newResponse.save({}, {
                                    beforeSend:setHeader,
                                    success: function(r, new_response){
                                        app.Response.add(new_response);
                                        //$(".m-r-sm.text-muted.notification-text").addClass("animated fadeInUp").html("Comment sent").fadeOut(5000);
                                        app.showNotification("success", "Discussion thread", "Your comment has been sent");
                                    }
                                });
                            }
                            $("textarea[responseid='0']").val("");
                        });
                    }
                }
            });
        }, 500);
    },
    createInquiry: function(){
        this.isAuthenticated();
        this.removeEditButton();

        this.showJoinCreateButton();

        app.showView(".row.inquiry", new InquiryNewView());

        app.changeTitle("New inquiry");
        app.breadcrumbManager(0, "");
        app.breadcrumbManagerSmall("#","list of inquiries");

        var _gameId = 0;

        $("#wizard").steps({
            bodyTag: "div.step-content",
            onStepChanging: function (event, currentIndex, newIndex){

                // Suppress (skip) "Warning" step if the user is old enough.
                if (currentIndex === 0){

                    if(_gameId != 0){
                        var newGame = new Game({ gameId: _gameId, title: $("#inquiry-title-value").val(), description: $("#inquiry-description-value").val() });
                        newGame.save({}, { beforeSend:setHeader });
                    }else{
                        var newGame = new Game({ title: $("#inquiry-title-value").val(), description: $("#inquiry-description-value").val() });
                        newGame.save({}, {
                            beforeSend:setHeader,
                            success: function(r, new_response){
                                _gameId = new_response.gameId;
                                var _name = new_response.title;
                                var _description = new_response.description;

                                app.createCookie("dojoibl.game", _gameId);


                                //////////////////////
                                // Give access to Game
                                //////////////////////
                                var newAccessGame = new GiveAccessToGame();
                                newAccessGame.gameId = new_response.gameId;
                                newAccessGame.accoundId = $.cookie("dojoibl.accountType")+":"+$.cookie("dojoibl.localId");
                                newAccessGame.accessRight = 1;
                                newAccessGame.fetch({}, { beforeSend:setHeader });

                                app.GameList.add(new_response);

                                /////////////////////////////////
                                // Create the run for the inquiry
                                /////////////////////////////////
                                var newRun = new Run({
                                    title: _name,
                                    description: _description,
                                    gameId: _gameId
                                });
                                newRun.save({}, {
                                    beforeSend:setHeader,
                                    success: function(r, new_response){
                                        console.log(new_response);
                                        app.RunList.add(new_response);

                                        app.createCookie("dojoibl.code", new_response.code);

                                        /////////////////////
                                        // Give access to Run
                                        /////////////////////
                                        var newAccessRun = new GiveAccessToRun();
                                        newAccessRun.runId = new_response.runId;
                                        newAccessRun.accoundId = $.cookie("dojoibl.accountType")+":"+$.cookie("dojoibl.localId");
                                        newAccessRun.accessRight = 1;
                                        newAccessRun.fetch({}, { beforeSend:setHeader });

                                        ////////////////////
                                        // Add user to a run
                                        ////////////////////
                                        var newUserForRun = new AddUserToRun({
                                            runId: new_response.runId,
                                            email: $.cookie("dojoibl.accountType")+":"+$.cookie("dojoibl.localId"),
                                            accountType: $.cookie("dojoibl.accountType"),
                                            localId: $.cookie("dojoibl.localId"),
                                            gameId: $.cookie("dojoibl.game") });
                                        newUserForRun.save({}, { beforeSend:setHeader });

                                        app.showNotification("success", "Inquiry created successfully", "You can find "+_name+" in your inquiry list.");

                                    }
                                });
                            }
                        });
                    }
                }

                if (currentIndex === 5){
                    console.log("Create roles and assign them to the game");
                }

                var form = $(this).find("form");

                // Clean up if user went backward before
                if (currentIndex < newIndex){
                    // To remove error styles
                    $(".body:eq(" + newIndex + ") label.error", form).remove();
                    $(".body:eq(" + newIndex + ") .error", form).removeClass("error");
                }

                // Disable validation on fields that are disabled or hidden.
                form.validate().settings.ignore = ":disabled,:hidden";

                // Start validation; Prevent going forward if false
                return form.valid();
            },
            onStepChanged: function (event, currentIndex, priorIndex){
            },
            onCanceled: function (events){
                app.navigate('#', true);
            },
            onFinishing: function (event, currentIndex){

                var form = $(this).find("form");

                // Disable validation on fields that are disabled or hidden.
                form.validate().settings.ignore = ":disabled,:hidden";

                if(form.valid()){
                    $('.row.inquiry').html(new NewInquiryCode({ code: $.cookie("dojoibl.code") }).render().el);
                }


                return form.valid();

            },
            onFinished: function (event, currentIndex) {
            },
            afterSync: function(event){

            }
        }).validate({
            errorPlacement: function (error, element)
            {
                element.before(error);
            },
            rules: {
                inquiry_title: "required",
                inquiry_description: "required"
            }
        });

        var pageNum = 1;

        ////////////////////
        // Manage activities
        ////////////////////
        this.removeActivity();

        ////////////////
        // Manage phases
        ////////////////
        $("li.new-phase").click(function(e){
            e.preventDefault();
            app.newPhaseNewInquiry();
        });
        this.removePhase();
    },
    editInquiry: function(id){
        this.isAuthenticated();
        app.showView(".row.inquiry", new InquiryNewView());

        app.removeEditButton();
        app.showJoinCreateButton();
        app.breadcrumbManager(0, "");
        app.breadcrumbManagerSmall("#","list of inquiries");

        var _gameId = id;

        $.cookie("dojoibl.game", _gameId);

        if($("#inquiry-title-value").val() == "" && $("#inquiry-description-value").val() == ""){
            var game = new GameCollection({  });
            game.gameId = _gameId;
            game.fetch({
                beforeSend: setHeader,
                success: function (response, game) {

                    app.changeTitle("Editing inquiry '"+game.title+"'");

                    $("#inquiry-title-value").val(game.title);
                    $("#inquiry-description-value").val(game.description);

                    var _number_phase = 0;
                    game.phases.forEach(function(){

                        var _phase = new NewPhaseNewInquiryView({}).render().el;
                        _number_phase += 1;
                        _phase.id = "tab-"+_number_phase;
                        $(".tab-content").append(_phase);

                        $('<li><a data-toggle="tab" href="#tab-'+_number_phase+'" > Phase '+_number_phase+'<i class="fa fa-remove remove-phase"></i></a></li>')
                            .insertBefore($("ul.select-activities > li.new-phase"));


                        $( ".tab-content .activities" ).sortable({
                            connectWith: "div.activities"
                        });

                        app.removePhase();
                    });

                    $(".select-activities > li:first-child").addClass("active");
                    $(".tab-content > div.tab-pane:first-child").addClass("active");
                }
            });
        }

        this.ActivityList = new ActivityEdit({ });
        this.ActivityList
        this.ActivityList.gameId = _gameId;

        this.ActivityList.fetch({
            beforeSend: setHeader,
            success: function (response, results) {
                console.log(results);

                var section = "";
                _.each(results.generalItems, function(gi){

                    if(!gi.deleted){

                        if(gi.section != ""){

                            var icon;
                            switch(gi.type){
                                case "org.celstec.arlearn2.beans.generalItem.AudioObject":
                                    icon = '<i class="fa fa-external-link"></i> ';
                                    break;
                                case "org.celstec.arlearn2.beans.generalItem.NarratorItem":
                                    icon = '<i class="fa fa-file-text"></i> ';
                                    break;
                                case "org.celstec.arlearn2.beans.generalItem.SingleChoiceImageTest":
                                    icon = '<i class="fa fa-sitemap"></i> ';
                                    break;
                                case "org.celstec.arlearn2.beans.generalItem.VideoObject":
                                    icon = '<i class="fa fa-file-movie-o"></i> ';
                                    break;
                                case "org.celstec.arlearn2.beans.generalItem.OpenBadge":
                                    icon = '<i class="fa fa-link"></i> ';
                                    break;
                                case "org.celstec.arlearn2.beans.generalItem.ScanTag":
                                    icon = '<i class="fa fa-file-archive"></i> ';
                                    break;
                            }

                            $("#tab-"+gi.section+" .activities").append('<div class="drag external-event navy-bg remove" data="'+gi.type+'" id="'+gi.id+'">'+icon+' '+gi.name+'</div>');

                        }
                    }
                });
            }
        });

        $("#wizard").steps({
            enableAllSteps: true,
            bodyTag: "div.step-content",
            onStepChanging: function (event, currentIndex, newIndex){

                // Suppress (skip) "Warning" step if the user is old enough.
                if (currentIndex === 0){
                    var newGame = new Game({ gameId: _gameId, phases: app.checkPhases(),  title: $("#inquiry-title-value").val(), description: $("#inquiry-description-value").val() });
                    newGame.save({},{ beforeSend:setHeader });
                }

                if (currentIndex === 5){
                    console.log("Create roles and assign them to the game");
                }

                var form = $(this).find("form");

                // Clean up if user went backward before
                if (currentIndex < newIndex){
                    // To remove error styles
                    $(".body:eq(" + newIndex + ") label.error", form).remove();
                    $(".body:eq(" + newIndex + ") .error", form).removeClass("error");
                }

                // Disable validation on fields that are disabled or hidden.
                form.validate().settings.ignore = ":disabled,:hidden";

                // Start validation; Prevent going forward if false
                return form.valid();
            },
            onStepChanged: function (event, currentIndex, priorIndex){
            },
            onCanceled: function (events){
                app.navigate('#', true);
            },
            onFinishing: function (event, currentIndex){

                var form = $(this).find("form");

                // Disable validation on fields that are disabled or hidden.
                //form.validate().settings.ignore = ":disabled,:hidden";

                return form.valid();
            },
            onFinished: function (event, currentIndex) {

                ////////////////////////
                // Update phases in Game
                ////////////////////////
                var updateGame = new Game({ gameId: _gameId, phases: app.checkPhases(), title: $("#inquiry-title-value").val(), description: $("#inquiry-description-value").val()  });
                updateGame.save({},{ beforeSend:setHeader });

                var _p = $(".tab-pane.active").attr("id").substring(4,5);

                if(_p != ""){
                    app.cleanMainView();
                    app.navigate('#inquiry/'+_gameId+'/phase/'+_p, true);
                }else{
                    app.navigate('#', true);
                }
            },
            afterSync: function(event){

            }
        }).validate({
            errorPlacement: function (error, element)
            {
                element.before(error);
            },
            rules: {
                inquiry_title: "required",
                inquiry_description: "required"
            }
        });

        var pageNum = 1;

        ////////////////////
        // Manage activities
        ////////////////////
        this.removeActivity();

        ////////////////
        // Manage phases
        ////////////////
        $("li.new-phase").click(function(e){
            e.preventDefault();
            app.newPhaseNewInquiry();
        });
        this.removePhase();
    },
    personalProfile: function(){
        this.isAuthenticated();
        this.UsersList.fetch({
            beforeSend: setHeader,
            success: function(response, xhr) {
                $(".m-r-sm.text-muted.notification-text").html(xhr.givenName+" "+xhr.familyName);
                app.showView('ul.nav.metismenu > li:eq(0)', new UserView({ model: xhr }));

                var date = new Date();
                date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();

                $.cookie("dojoibl.accountType", xhr.accountType , {expires: date, path: "/"});
                $.cookie("dojoibl.localId", xhr.localId , {expires: date, path: "/"});
                $(".inquiry").html(new ProfileView({ model: xhr }).render().el);
            }
        });
        this.breadcrumbManagerSmall("","list of inquiries");
        this.changeTitle("Your profile");

    },

    // util functions
    initialGame: function(callback) {

        this.cleanMainView();

        //this.GameParticipateList = new GameParticipateCollection();
        //this.GameParticipateList.fetch({
        //    beforeSend: setHeader,
        //    success: successGameParticipateHandler
        //});
        //this.GameAccessList.fetch({
        //    beforeSend: setHeader,
        //    success: successGameHandler
        //});

        $('.inquiry').append(new GameListView({ collection: this.GameList }).render().el);

        console.log(this.GameList.length, this.GameList)

        if(this.GameList.length == 0){
            this.GameAccessList.fetch({
                beforeSend: setHeader,
                success: function(e, response){
                    _.each(response.gamesAccess, function(gameAccess){
                        var game = new GameCollection({ });
                        game.gameId = gameAccess.gameId;
                        game.fetch({
                            beforeSend: setHeader,
                            success: function (response, game) {
                                ///////////////////////////////////////////////
                                // Checking if the game is deleted or
                                // there is an access game but there is no game
                                ///////////////////////////////////////////////
                                if(!game.deleted && game.error != "game does not exist"){
                                    app.GameList.add(game);
                                }
                            }
                        });
                    });
                }
            });
        }

    },
    initialRun: function(callback) {
        if (this.RunList) {
            if (callback)
                callback();
        } else {
            this.RunAccessList = new RunAccessCollection();
            this.RunAccessList.fetch({
                beforeSend: setHeader,
                success: function(response, xhr) {

                    _.each(xhr.runAccess, function(e){

                        this.RunList.id = e.runId;

                        this.RunList.fetch({
                            beforeSend: setHeader,
                            success: function (response, results) {

                                $('#inquiries > div > div.box-body').append( new RunListView({ model: results }).render().el );
                                if (callback)
                                    callback();
                            }
                        });
                    });
                }
            });
        }
    },
    newPhaseNewInquiry: function(){
        var _phase = new NewPhaseNewInquiryView({}).render().el;

        var _number_phase = $("div[id*='tab']").length;
        _number_phase += 1;

        _phase.id = "tab-"+_number_phase;
        $(".tab-content").append(_phase);

        $('<li><a data-toggle="tab" href="#tab-'+_number_phase+'" > Phase '+_number_phase+'<i class="fa fa-remove remove-phase"></i></a></li>')
            .insertBefore($("ul.select-activities > li.new-phase"));

        $( ".tab-content .activities" ).sortable({
            connectWith: "div.activities"
        });

        app.removePhase();
    },
    checkPhases: function(){
        var phases = [];

        $("ul.select-activities").children("li:not(.new-phase)").each(function () {
            var item = {}
            item ["title"] = $(this).find("a").text();
            item ["phaseId"] = $(this).find("a").attr("href").substring(5,6);
            item ["type"] = "org.celstec.arlearn2.beans.game.Phase";
            phases.push(item);
        });

        return phases;
    },
    removeActivity: function(){
        $("button.remove-activity").click(function(){
            console.log($(this));
            $(this).parent().parent().remove();
        });
    },
    removePhase: function(){
        $(".remove-phase").click(function(){
            console.warning("TODO: Delete phase. Delete all the general items under it");
            var tabId = $(this).parents('li').children('a').attr('href');
            $(this).parents('li').remove('li');
            $(tabId).remove();
            $(".tabs-container tab-content").addClass("active");
            ////reNumberPages();
            //$('#pageTab a:first').tab('show');
        });
    },
    showView: function(selector, view) {
        if (this.currentView) {
            this.currentView.close();
        }
        $(selector).html(view.render().el);
        this.currentView = view;
        return view;
    },
    createCookie: function (name, value) {
        var date = new Date();
        date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();

        $.cookie(name, value, {expires: date, path: "/"});
    },
    showNotification: function(type, title, message){
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "progressBar": true,
            "preventDuplicates": false,
            "positionClass": "toast-top-right",
            "onclick": null,
            "showDuration": "70000",
            "hideDuration": "70000",
            "timeOut": "70000",
            "extendedTimeOut": "70000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
        //if ($('#addBehaviorOnToastClick').prop('checked')) {
        //    toastr.options.onclick = function () {
        //        alert('You can perform some custom action after a toast goes away');
        //    };
        //}
        //$("#toastrOptions").text("Command: toastr["
        //    + shortCutFunction
        //    + "](\""
        //    + msg
        //    + (title ? "\", \"" + title : '')
        //    + "\")\n\ntoastr.options = "
        //    + JSON.stringify(toastr.options, null, 2)
        //);
        var $toast = toastr[type](message, title); // Wire up an event handler to a button in the toast, if it exists
    },
    getDataForm: function($form){
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};

        $.map(unindexed_array, function(n, i){
            indexed_array[n['name']] = n['value'];
        });

        return indexed_array;
    },
    secureAccess: function(run){
        // TODO check runAccess
    },

    // chat
    initializeChannelAPI: function(){
        if(!this.ChannelAPI){
            //console.debug("[initializeChannelAPI]", "Initializing the chat");

            this.ChannelAPI = new ChannelAPICollection();
            this.ChannelAPI.fetch({
                beforeSend: setHeader,
                success: function(response, xhr){

                    channel = new goog.appengine.Channel(xhr.token);
                    socket = channel.open();

                    socket.onopen = function() {
                        ///////////////////////////////////////////////////////////////////////////////////////
                        // TODO Block the chat until is connected
                        ///////////////////////////////////////////////////////////////////////////////////////
                        $('#messages').append('<p>Connected!</p>');
                    };

                    socket.onmessage = function(message) {
                        var a = $.parseJSON(message.data);

                        // TODO create a getMessage service on the API
                        //if(app.MessagesList.where({ id: a.messageId }).length == 0){
                        //    console.log("dentro");
                        //    var message = new Message({ id: a.messageId });
                        //    message.fetch({
                        //        beforeSend: setHeader
                        //    });
                        //    app.MessagesList.add(message);
                        //}

                        //console.log(app.MessagesList);

                        if (a.type == "org.celstec.arlearn2.beans.notification.MessageNotification") {
                            if ($('.chat-discussion').length) {
                                console.log(a);
                                var aux = a.messageId;
                                $('.chat-discussion').append(new MessageFromNotificationView({model: a}).render().el);
                                //if (a.senderId == app.UserList.at(0).toJSON().localId){
                                //    $('.direct-chat-messages').append(new MessageLeftView({ model: a }).render().el);
                                //}else{
                                //    $('.direct-chat-messages').append(new MessageRightView({ model: a }).render().el);
                                //}

                                $('.chat-discussion').animate({
                                    scrollTop: $('.chat-discussion')[0].scrollHeight
                                }, 200);
                            }
                            //else {
                            //    ///////////////////////////////////////////////////////////////////////////////////////
                            //    // TODO We would need to check here if I have other windows open not nofifying myself again.
                            //    // TODO Changes in one collection modifies a view: http://stackoverflow.com/questions/10341141/backbone-multiple-views-subscribing-to-a-single-collections-event-is-this-a-b
                            //    ///////////////////////////////////////////////////////////////////////////////////////
                            //    $('.messages-menu > ul').append(new MessageNotificationView({model: a}).render().el);
                            //
                            //    var new_floating_notification = new GeneralFloatingNotificationView({model: a}).render().el;
                            //
                            //    var message_notifications = $('.messages-menu span.label-success').html();
                            //
                            //    if (message_notifications != "" && message_notifications > 0) {
                            //        message_notifications = parseInt(message_notifications) + 1;
                            //        $('.messages-menu span.label-success').html(message_notifications);
                            //    } else {
                            //        $('.messages-menu span.label-success').html(1);
                            //    }
                            //
                            //    /////////////////////////
                            //    // Floating notifications
                            //    /////////////////////////
                            //    var top = $(new_floating_notification).position().top;
                            //
                            //    var max_top = 64;
                            //
                            //    var pile_notifications = $('body').find($(".ui-pnotify.stack-topleft")).length;
                            //
                            //    max_top = max_top + 100 * pile_notifications;
                            //
                            //    console.log("Adding notification: Pixels:", max_top, "Bubbles:" + pile_notifications);
                            //
                            //    $(new_floating_notification).css({top: max_top + 'px'});
                            //
                            //    $('body').append(new_floating_notification);
                            //
                            //    setTimeout(showNotifications, 5000);
                            //    function showNotifications() {
                            //        $(new_floating_notification).remove();
                            //
                            //        $.each($(".ui-pnotify.stack-topleft"), function (key, value) {
                            //            var top = $(this).position().top;
                            //
                            //            if (top == "64") {
                            //                $(this).remove();
                            //            }
                            //
                            //            var descrease_top = top - 100 * pile_notifications;
                            //            //max_top = max_top - 100;
                            //
                            //            console.log("Removing notification: Pixels:", max_top, "Bubbles:" + pile_notifications, "Decrementar pixels:" + descrease_top);
                            //
                            //
                            //            $(this).css({top: descrease_top + 'px'});
                            //        });
                            //    }
                            //
                            //}
                        }

                        //if (a.type == "org.celstec.arlearn2.beans.run.Response") {
                        //    /////////////////////////
                        //    // Sidebar notifications
                        //    /////////////////////////
                        //    $("ul.notifications-side-bar").prepend(new NotificationSideBarView({model: a}).render().el)
                        //}
                    };

                    socket.onerror = function() { $('#messages').append('<p>Connection Error!</p>'); };
                    socket.onclose = function() { $('#messages').append('<p>Connection Closed!</p>'); };
                }
            });
        }
    },
    loadChat: function(){

        if($(".chat-discussion").length != 0){
            console.log("hay chat");
        }

        console.debug("[loadChat]", "Loading the chat content");
        this.MessagesList = new MessageCollection();
        this.MessagesList.id = $.cookie("dojoibl.run");
        this.MessagesList.fetch({
            beforeSend: setHeader,
            success: function (response, xhr) {

                console.info("TODO: retrieve messages per blocks");

                _.each(xhr.messages, function(message){
                    //console.log(message);
                    //////////////////////////////////////////////////////////////
                    // TODO make different type of message if it is not my message
                    // TODO place the focus at the end of the chat box
                    //////////////////////////////////////////////////////////////
                    if (message.senderId == app.UsersList.at(0).toJSON().localId){
                        $('.chat-discussion').append(new MessageRightView({ model: message }).render().el);
                    }else{
                        $('.chat-discussion').append(new MessageLeftView({ model: message }).render().el);
                    }

                    //if($('.chat-discussion').length != 0){
                    //    console.log($('.chat-discussion')[0])
                    //    $('.chat-discussion').animate({
                    //        scrollTop: $('.chat-discussion')[0].scrollHeight
                    //    }, 0);
                    //}else{
                    //    console.log($('.chat-discussion'));
                    //}

                });
            }
        });

        //$('.direct-chat-messages').animate({
        //    scrollTop: $('.direct-chat-messages')[0].scrollHeight
        //}, 2000);
    },

    // common
    breadcrumbManager: function(level, title_1, title_2){
        $(".col-sm-7.breadcrumb-flow.tooltip-demo").html("");

        for (var i = 0; i < level; i++) {
            $(".col-sm-7.breadcrumb-flow.tooltip-demo").append(new ItemBreadcrumbView({ }).render().el);
            switch(i){
                case 0:
                    // Inquiry
                    $(".col-sm-7.breadcrumb-flow.tooltip-demo > div:nth-child("+1+")").addClass("phase ");
                    $(".col-sm-7.breadcrumb-flow.tooltip-demo > div:nth-child("+1+") > .phases-breadcrumb").attr({ "title": title_1 });

                    break;
                case 1:
                    // Phase
                    $(".col-sm-7.breadcrumb-flow.tooltip-demo > div:nth-child("+2+")").addClass("activity animated tada");
                    $(".col-sm-7.breadcrumb-flow.tooltip-demo > div:nth-child("+2+") > .phases-breadcrumb").attr({ "title": title_2 });
                    $(".col-sm-7.breadcrumb-flow.tooltip-demo > div:nth-child("+2+") > .phases-breadcrumb > input").attr({ "value": 23 });
                    break;
            }
            $(".col-sm-7.breadcrumb-flow.tooltip-demo > div").removeClass("animated tada");
            $(".col-sm-7.breadcrumb-flow.tooltip-demo > div:last-child").addClass("animated tada");
        }
    },
    breadcrumbManagerSmall: function(routing, label){
        $("ol.bradcrumb").show();
        $("ol.breadcrumb").html('<li><a href="'+routing+'"><i class="fa fa-angle-left"></i> <strong>Back to '+label+'</strong></a></li>');
    },
    breadcrumbManagerSmallHide: function(){
        $("ol.bradcrumb").hide();
    },
    changeTitle: function(title) {
        $('.row.wrapper.border-bottom.white-bg.page-heading > div > h2').html(title);
    },
    cleanMainView: function(){
        $('.inquiry').html("");
        //$('.inquiry div:not(.default-hint)').remove();
        //$('.default-hint').show();
    },
    common: function(callback) {
        app.UsersList.fetch({
            beforeSend: setHeader,
            success: function(response, xhr) {
                $(".m-r-sm.text-muted.notification-text").html(xhr.givenName+" "+xhr.familyName);
                app.showView('ul.nav.metismenu > li:eq(0)', new UserView({ model: xhr }));

                var date = new Date();
                date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();

                $.cookie("dojoibl.accountType", xhr.accountType , {expires: date, path: "/"});
                $.cookie("dojoibl.localId", xhr.localId , {expires: date, path: "/"});
            }
        });
    },
    loadInquiryUsers: function(id){
        if(!this.InquiryUsers){
            // Load users of the Inquiry
            this.InquiryUsers = new UserRunCollection({});
            this.InquiryUsers.runId = id;
            this.InquiryUsers.fetch({
                beforeSend: setHeader,
                success: successInquiryUsers
            });
        }
    },
    createEditButton: function(gameId){
        $(".edit-inquiry").attr("href","#inquiry/edit/"+gameId);
        $(".edit-inquiry").show();
    },
    removeEditButton: function(){

        $(".edit-inquiry").hide();
        $(".edit-inquiry").attr("href","");
    },
    showJoinCreateButton: function(gameId){
        $(".new-inquiry").show();
    },
    removeJoinCreateButton: function(){
        $(".new-inquiry").hide();
    },

    // authentication
    isAuthenticated: function (){
        app.UsersList.fetch({
            beforeSend: setHeader,
            success: function(response, xhr) {
                if(typeof xhr == 'undefined' || xhr.errorCode == 2){
                    if(window.location.hostname.toLowerCase().indexOf("localhost") >= 0){
                        window.location = "https://wespot-arlearn.appspot.com/Login.html?client_id=wespotClientId&redirect_uri=http://localhost:8888/oauth/wespot&response_type=code&scope=profile+email";
                    }else{
                        window.location = "https://wespot-arlearn.appspot.com/Login.html?client_id=wespotClientId&redirect_uri=https://dojo-ibl.appspot.com/oauth/wespot&response_type=code&scope=profile+email";
                    }
                }
            }
        });
    },
    logout: function() {
        $.cookie("dojoibl.run", null, { path: '/' });
        $.cookie("dojoibl.game", null, { path: '/' });
        $.cookie("arlearn.AccessToken", null, { path: '/' });
        $.cookie("arlearn.OauthType", null, { path: '/' });
        app.navigate('');
        window.location.replace("/");
    }
});

var messageNotifications = function (r, a, message){
    console.log(message);
};

var successInquiryUsers = function(response, xhr){
    $('span.label.label-success.number-participants').html((xhr.users.length == 1) ? xhr.users.length+" user" :xhr.users.length+" users" );
    _.each(xhr.users, function(participant){
        $('ul.users-list').append( new UsersInquiryView({ model: participant}).render().el );
    });
};

var successGameParticipateHandler = function(response, xhr){

    _.each(xhr.games, function(game){
        //console.log(game);
        if(!game.deleted){
            var _gl = app.GameList.get(game.gameId);
            if(!_gl) {
                app.GameList.add(game);
            }
        }
    });

    app.GameAccessList.fetch({
        beforeSend: setHeader,
        success: successGameHandler
    });
};

var successGameHandler = function(response, xhr){

    ///////////////////////////////////////////////////
    // We save the serverTime to optimize the next call
    ///////////////////////////////////////////////////
    app.GameAccessList.from = xhr.serverTime;


    //_.each(xhr.gamesAccess, function(e){
    //    //console.log(e);
    //    var _gl = app.GameList.get(e.gameId);
    //
    //    if(!_gl) {
    //        var game = new GameCollection({  });
    //        game.gameId = e.gameId;
    //        game.fetch({
    //            beforeSend: setHeader,
    //            success: function (response, game) {
    //                if(!game.deleted)
    //                    $('.inquiry').append( new GameListView({ model: game, v: 2 }).render().el );
    //            }
    //        });
    //        app.GameList.add(game);
    //    }else{
    //        var game = _gl;
    //        $('.inquiry').append( new GameListView({ model: game.toJSON(), v: 1 }).render().el );
    //    }
    //});


};

tpl.loadTemplates(['main', 'game','game_teacher', 'inquiry', 'run', 'user', 'user_sidebar', 'phase', 'activity', 'activity_text','activity_details', 'inquiry_structure',
    'inquiry_sidebar', 'activityDependency', 'message', 'message_right', 'inquiry_left_sidebar','message_own', 'response', 'response_discussion', 'response_treeview','response_author', 'response_discussion_author',
    'message_notification','notification_floating', 'activity_video', 'activity_widget', 'activity_discussion', 'notification_sidebar', 'user_inquiry','activity_tree_view',
    'item_breadcrumb_phase'
    , 'item_breadcrumb_activity','new_inquiry_code','activity_html', 'response_reply', 'new_inquiry', 'activity_concept_map', 'new_activity_new_inquiry', 'new_phase_new_inquiry',
    'new_form', 'profile', 'activity_data_collection', 'response_grid_item'], function() {
    app = new AppRouter();
    Backbone.history.start();
});
