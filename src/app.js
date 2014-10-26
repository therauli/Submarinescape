
var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    space: null,
    shapoid: null,
    drawNode: null,
    startPoint: null,
    toRemove: [],
    toRemoveStatic: [],
    toAddShape: [],
    toAddBody: [],
    oldShape: null,
    newSpage: null,
    ctor: function () {
        this._super();

        this.currentLevel = 0;
        
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
        cc.audioEngine.playMusic(res.song_ogg, true);

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
            shape.setCollisionType(10);
            space.addStaticShape(shape);
            
        }

        //add collision tag for bottom wall
        walls[0].setCollisionType(2);

        
        // Gravity
        space.gravity = cp.v(0, -100);

        // collisionhandler        
        space.addCollisionHandler(1, 2, this.collisionBottomBegin.bind(this), null, null, null);

        space.addCollisionHandler(1, 3, this.collisionEndBegin.bind(this), null, null, null);

        space.addCollisionHandler(1, 6, this.collisionPipeBeg.bind(this),
                                        this.collisionPipePre.bind(this), 
                                        this.collisionPipePost.bind(this),
                                        null);

        space.addCollisionHandler(1, 10, this.collisionPlatformBegin.bind(this), null, null, null);

        space.addCollisionHandler(1, 5, this.collisionYellowSugarBeg.bind(this), 
                                        this.collisionYellowSugarPre.bind(this), 
                                        this.collisionYellowSugarPost.bind(this),
                                        this.collisionYellowSugarSep.bind(this));

         space.addCollisionHandler(1, 7, this.collisionBlueSugarBeg.bind(this), 
                                         this.collisionBlueSugarPre.bind(this), 
                                         this.collisionBlueSugarPost.bind(this),
                                         this.collisionBlueSugarSep.bind(this));

         space.addCollisionHandler(1, 8, this.collisionRedSugarBeg.bind(this), 
                                         this.collisionRedSugarPre.bind(this), 
                                         this.collisionRedSugarPost.bind(this),
                                         this.collisionRedSugarSep.bind(this));
        // debug stuph
        this._debugNode = new cc.PhysicsDebugNode(space);
        this._debugNode.visible = true; //set this 
        this.addChild(this._debugNode, 1000);       

       
    },

    loadLevel : function(lvl) {

        cc.log(lvl, levels.length);
        if (lvl >= levels.length) {
            var label = cc.LabelTTF.create("YOU WIN GAME!!!!", "Arial", 35);
            this.addChild(label, 1000);
            label.setPosition(cc.winSize.width / 2, - 50);
            label.runAction(cc.MoveTo.create(3, cc.p(cc.winSize.width / 2, cc.winSize.height / 2)));
         
            return;
        }

        var backgroundSize = cc.winSize;
        this.sprite = new cc.Sprite(res.bacground_png);
        this.addChild(this.sprite, 0);
        this.sprite.setOpacity( 150 );
        this.sprite.setPosition(backgroundSize.width / 2,
                                backgroundSize.height / 2 );
        
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

        if( levels[lvl]["obstacles"] !== undefined ) {
            for( var i = 0 ; i < levels[lvl]["obstacles"].length; i++ ) {
                this.addPipe( levels[lvl]["obstacles"][i] )
            }
        }

        cc.log('Obstacles, done');

        // set sugar if any
        if( levels[lvl]["yellowSugar"] !== undefined ) {
            var yellowSugar = new YellowSugar(this.space.staticBody, levels[lvl]["yellowSugar"]);
            space.addStaticShape( yellowSugar.shape );
            this.addChild(yellowSugar, 100 );
        }
        if( levels[lvl]["blueSugar"] !== undefined ) {
            var blueSugar = new BlueSugar(this.space.staticBody, levels[lvl]["blueSugar"]);
            space.addStaticShape( blueSugar.shape );
            this.addChild(blueSugar, 100 );
        }
        if( levels[lvl]["redSugar"] !== undefined ) {
            var redSugar = new RedSugar(this.space.staticBody, levels[lvl]["redSugar"]);
            space.addStaticShape( redSugar.shape );
            this.addChild(redSugar, 100 );
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
        this.shapoid.morphToCircloid();

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


    collisionYellowSugarBeg : function(arbiter, space) {
        cc.log('Yellow sugar beg');
        this.oldShape = this.shapoid.shape;
        this.shapoid.morphToTriangloid();
        this.newShape = this.shapoid.shape;
        return true;
    },
    
    collisionYellowSugarPre : function(arbiter, space) {
        cc.log('Yellow sugar pre');
        return true;
    },

    collisionYellowSugarSep : function(arbiter, space) {
        cc.log('Yellow sugar sepa');
    },
      

    collisionYellowSugarPost : function(arbiter, space) {
        cc.log('Yellow sugar post');
    },

    collisionBlueSugarBeg : function(arbiter, space) {
        cc.log('Blue sugar beg');
        this.oldShape = this.shapoid.shape;
        this.shapoid.morphToEllipsoid();
        this.newShape = this.shapoid.shape;
        return true;
    },
    
    collisionBlueSugarPre : function(arbiter, space) {
        cc.log('Blue sugar pre');
        return true;
    },

    collisionBlueSugarSep : function(arbiter, space) {
        cc.log('Blue sugar sepa');
    },
      

    collisionBlueSugarPost : function(arbiter, space) {
        cc.log('Blue sugar post');
    },

    collisionRedSugarBeg : function(arbiter, space) {
        cc.log('Redlue sugar beg');
        this.oldShape = this.shapoid.shape;
        this.shapoid.morphToCircloid();
        this.newShape = this.shapoid.shape;
        return true;
    },
    
    collisionRedSugarPre : function(arbiter, space) {
        cc.log('Red sugar pre');
        return true;
    },

    collisionRedSugarSep : function(arbiter, space) {
        cc.log('Red sugar sepa');
    },
      

    collisionRedSugarPost : function(arbiter, space) {
        cc.log('Red sugar post');
    },

    collisionPlatformBegin : function(arbiter, space) {
        cc.log('bounce');
        if (this.shapoid.getType() === "circloid") {
            cc.audioEngine.playEffect(res.bounce_ogg);
            var scaleBig = cc.ScaleTo.create(0.05, 1.5, 1.0);
            var scaleBack = cc.ScaleTo.create(0.05, 1.0, 1.0);
            this.shapoid.runAction(cc.sequence(scaleBig, scaleBack).repeat(2));
        }

        return true;
    },

    collisionPipeBeg : function(arbiter, space) {
        cc.log('pipe begin');
        return true;
    },

    collisionPipePre : function(arbiter, space) {
        cc.log('pipe pre');
        return true;
    },

    collisionPipePost : function(arbiter, space) {
        cc.log('post pipe');

        if (this.shapoid.getType() !== "triangloid") {
            cc.log("Wring type");
            return;
        }


        console.log(arbiter);

        var a = arbiter.getA();
        var b = arbiter.getB();

        var pipe = a.collision_type == 6 ? a : b;
        var body = pipe.getBody();
        
        if (!body.isStatic()) {
            cc.log('pipe is not static');
            return;
        }

        cc.log('bb', body);
        
        body.nodeIdleTime = 0;
        body.setMass(100);
        
        this.toRemoveStatic.push(pipe);

        this.toAddShape.push(pipe);
        this.toAddBody.push(body);


        this.resetShapoid();

        
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
        shape.setCollisionType(10);
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

    addPipe : function( pos ) {        
        cc.log('Adding pipe:', pos);
        var pipe = new Pipe(pos);
        //this.addChildPhysics(pipe, 10);
        this.addChild(pipe, 10);
        this.space.addStaticShape(pipe.shape);
        pipe.setVisible(true);
        pipe.getBody().resetForces();
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

        for (i = 0; i < this.toRemoveStatic.length; i += 1) {
            this.space.removeStaticShape(this.toRemoveStatic[i]);
        }

        this.toRemoveStatic = [];

        for (i = 0; i < this.toAddShape.length; i += 1) {
            var shape = this.toAddShape[i];
            shape.setElasticity(0.5);
            shape.setFriction(0.5);
            this.space.addShape(shape);
        }

        this.toAddShape = [];

        for (i = 0; i < this.toAddBody.length; i += 1) {
            var body = this.toAddBody[i];
            this.space.addBody(body);
            var a = this.shapoid.getPosition();
            var p = body.p;
            body.applyImpulse(cp.v((p.x - a.x) * 500, (p.y - a.y) * 500), cp.vzero);
            
        }

        this.toAddBody = [];

    },
    
    addChildPhysics: function(obj, z) {
        this.addChild(obj, z);
        
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

var BlueSugar = cc.Sprite.extend({
    shape: null,
    ctor: function(staticBody, pos) {
        this._super();
        this.initWithFile(res.blue_sugar_png);
        cc.log('BlueSugar', pos);
   
        var size = this.getContentSize();
        
        var verts = [pos.x - size.width / 2, pos.y - size.height / 2,
                    pos.x - size.width / 2, pos.y + size.height / 2,
                    pos.x - size.width / 2+ size.width, pos.y + size.height / 2,
                    pos.x + size.width / 2, pos.y - size.height / 2];


        cc.log('BlueSugar', size);

        this.setPosition(pos);

        var shape = new cp.PolyShape(staticBody, verts, cp.vzero);
        shape.setCollisionType(7);

        shape.setSensor(true);
        this.shape = shape; 
    }
});

var RedSugar = cc.Sprite.extend({
    shape: null,
    ctor: function(staticBody, pos) {
        this._super();
        this.initWithFile(res.red_sugar_png);
        cc.log('RedSugar', pos);
   
        var size = this.getContentSize();
        
        var verts = [pos.x - size.width / 2, pos.y - size.height / 2,
                    pos.x - size.width / 2, pos.y + size.height / 2,
                    pos.x - size.width / 2+ size.width, pos.y + size.height / 2,
                    pos.x + size.width / 2, pos.y - size.height / 2];


        cc.log('RedSugar', size);

        this.setPosition(pos);

        var shape = new cp.PolyShape(staticBody, verts, cp.vzero);
        shape.setCollisionType(8);

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
