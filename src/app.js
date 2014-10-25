
var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    space: null,
    shapoid: null,
    drawNode: null,
    startPoint: null,
    toRemove: [],
    oldShape: null,
    newSpage: null,
    ctor: function () {
        this._super();

        var size = cc.winSize;
        this.currentLevel = 1;
        this.sprite = new cc.Sprite(res.bacground_png);
        this.addChild(this.sprite, 0);
        this.sprite.setOpacity( 150 );
        this.sprite.setPosition(size.width / 2,
                                size.height / 2 );

        cc.log('whee');

        this.scheduleUpdate();
        
        var that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event){
                var x = 0;
                if (keyCode == 39) {
                    x = 1;
                }

                if (keyCode == 37) {
                    x = -1;
                }
                var dir = cp.v(x, 0);

                //debug stuff only
                if (keyCode == 32) {
                    switch( that.shapoid.type ) {
                        case "triangloid" :
                            cc.log('triangloid space');
                            that.oldShape = that.shapoid.shape;
                            that.shapoid.morphToCircloid();
                            that.newShape = that.shapoid.shape;
                            that.resetShapoid();                            
                        break;
                        case "ellipsoid":
                            cc.log('ellipsoid space');
                        break;
                        default:
                            cc.log('sumtin else');
                        break;
                    }

                    //that.space.removeShape(that.shapoid.shape);
                    //that.shapoid.morphToEllipsoid();//Triangloid();
                    //that.space.addShape(that.shapoid.shape);
                }

                if (x !== 0) {
                    that.shapoid.handleMove(dir);
                }

            },
            onKeyReleased: function(keyCode, event){
                that.shapoid.resetImpulse();

            }
        }, that);


        this.loadLevel( this.currentLevel );
        return true;
    },
    
    initPhysics: function(winSize) {
        space = new cp.Space();
        this.space = space;

        var staticBody = space.staticBody;

        var walls = [new cp.SegmentShape(staticBody, cp.v(0,0), cp.v(winSize.width,0), 2),
                     new cp.SegmentShape(staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 1),
                     new cp.SegmentShape(staticBody, cp.v(0,0), cp.v(0,winSize.height), 1),
                     new cp.SegmentShape(staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 1)];

        walls[0].setCollisionType(2);
        for (var i = 0; i < walls.length; i++) {
            var shape = walls[i];
            shape.setElasticity(1.0);
            shape.setFriction(0.0);
            space.addStaticShape(shape);
        }

        //add collision tag for bottom wall
        walls[0].setCollisionType(2);
        
        // Gravity
        space.gravity = cp.v(0, -100);

        // collisionhandler        
        space.addCollisionHandler(1, 2, this.collisionBottomBegin.bind(this), null, null, null);

        // debug stuph
        this._debugNode = new cc.PhysicsDebugNode(space);
        this._debugNode.visible = true; //set this 
        this.addChild(this._debugNode, 1000);

        space.addCollisionHandler(1, 3, this.collisionEndBegin.bind(this), null, null, null);

        space.addCollisionHandler(1, 5, this.collisionSugarBeg.bind(this), 
                                        this.collisionSugarPre.bind(this), 
                                        this.collisionSugarPost.bind(this),
                                        this.collisionSugarSep.bind(this));
        cc.log('gggggggggg');
       
    },

    loadLevel : function(lvl) {
        this.initPhysics(cc.winSize);
        
        this.drawNode = new cc.DrawNode();
        this.addChild(this.drawNode, 10);

        this.shapoid = new Shapoid();
        this.addChildPhysics(this.shapoid, 10);

        this.resetShapoid();

        // Setup platforms
        for( var i = 0; i < levels[lvl]["platforms"].length; i++ ){
            this.addPlatform( levels[lvl]["platforms"][i] )

        }
        cc.log('Platforms, done');

        // setup obstacles if any        
        if( levels[lvl]["obstacles"] !== undefined ) {        
            for( var i = 0; i < levels[lvl]["obstacles"].length; i++ ){
                this.addObstacle( levels[lvl]["obstacles"][i] )
            }
        }
        cc.log('Obstacles, done');

        // set sugar if any
        if( levels[lvl]["sugar"] !== undefined ) {
            var yellowSugar = new YellowSugar(this.space.staticBody, levels[lvl]["sugar"]);
            space.addStaticShape( yellowSugar.shape );
            this.addChild(yellowSugar, 100 );
        }

        // endpoint
        var endPoint = new EndPoint(this.space.staticBody, levels[this.currentLevel]["end"]);
        space.addStaticShape(endPoint.shape);
        this.addChild(endPoint, 10);
    },

    resetShapoid : function () {
        this.shapoid.setVisible(true);
        this.startPoint = levels[this.currentLevel]["start"];
        this.shapoid.setPosition(this.startPoint);
        this.shapoid.getBody().resetForces();
        this.shapoid.setRotation( 0 );
        this.shapoid.getBody().setVel(cp.vzero);

    },

    collisionBottomBegin : function(arbiter, space) {
        cc.log("doom");
        this.resetShapoid();
    },

    collisionEndBegin : function(arbiter, space) {
        cc.log('win');
        var delay = cc.DelayTime.create(1);
        var call = cc.callFunc(function() {
            this.currentLevel += 1;
            this.loadLevel(this.currentLevel);
            cc.log('Joo');
        }, this);
        var seq = cc.sequence(delay, call);
        this.runAction(seq);
        this.toRemove.push(this.shapoid);
    },


    collisionSugarBeg : function(arbiter, space) {
        cc.log('NEED MOAR SUGAR');
        this.oldShape = this.shapoid.shape;
        this.shapoid.morphToTriangloid();
        this.newShape = this.shapoid.shape;
        return true;
    },
    
    collisionSugarPre : function(arbiter, space) {
        cc.log('suger pre');
        return true;
    },

    collisionSugarSep : function(arbiter, space) {
        cc.log('sugar sepa');
    },
      

    collisionSugarPost : function(arbiter, space) {
        cc.log('Sugar post');
    },

    addPlatform : function( rect ) {
        var verts = [
            rect.x, rect.y,
            rect.x, rect.y + rect.height,
            rect.x + rect.width, rect.y + rect.height,
            rect.x + rect.width, rect.y
        ];

    
        
        var shape = new cp.PolyShape(this.space.staticBody, verts, cp.vzero);
        shape.setElasticity(1.0);
        shape.setFriction(0.0);
        this.space.addStaticShape(shape);

        this.drawNode.drawRect(cc.p(rect.x, rect.y), cc.p(rect.x + rect.width, rect.y + rect.height), cc.color(255, 0, 0, 255), 1, cc.color(144, 0, 0 ,255));
    },

    addObstacle : function( rect ) {
        var verts = [
            rect.x, rect.y,
            rect.x, rect.y + rect.height,
            rect.x + rect.width, rect.y + rect.height,
            rect.x + rect.width, rect.y
        ];
        
        var shape = new cp.PolyShape(this.space.staticBody, verts, cp.vzero);
        shape.setElasticity(1.0);
        shape.setFriction(0.0);
        shape.setCollisionType(4);
        this.space.addStaticShape(shape);

        this.drawNode.drawRect(cc.p(rect.x, rect.y), cc.p(rect.x + rect.width, rect.y + rect.height), cc.color(127, 108, 179, 255), 1, cc.color(127, 108, 179 ,255));
    },

    update:function (dt) {
        // chipmunk step
        this.space.step(1/60);
        this.shapoid.update(dt);
        
        for (var i = 0; i < this.toRemove.length; i += 1) {
            this.removeChildPhysics(this.toRemove[i]);
        }
        this.toRemove = [];

        if (this.oldShape !== null) {
            this.space.removeShape(this.oldShape);
            this.space.addShape(this.newShape);
            this.oldShape = null;
            this.newShape = null;

        }


    },
    
    addChildPhysics: function(obj, z) {
        this.addChild(obj, z)
        
        cc.log('Adding', obj);
        
        this.space.addBody(obj.body);

        this.space.addShape(obj.shape);
        
        
    },

    removeChildPhysics : function(obj) {
        cc.log('Removing:', obj);
        this.removeChild(obj);
        this.space.removeBody(obj.getBody());
        this.space.removeShape(obj.shape);
    }


});

var YellowSugar = cc.Sprite.extend({
    shape: null,
    ctor: function(staticBody, pos) {
        this._super();
        this.initWithFile(res.yellow_sugar_png);
        cc.log('YellowSugar', pos);
   
        var size = this.getContentSize();
        
        var verts = [pos.x - size.width / 2, pos.y - size.height / 2,
                    pos.x - size.width / 2, pos.y + size.height / 2,
                    pos.x - size.width / 2+ size.width, pos.y + size.height / 2,
                    pos.x + size.width / 2, pos.y - size.height / 2];


        cc.log('YellowSugar', size);

        this.setPosition(pos);

        var shape = new cp.PolyShape(staticBody, verts, cp.vzero);
        shape.setCollisionType(5);

        shape.setSensor(true);
        this.shape = shape;
 
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});
