var Shapoid = cc.Sprite.extend({
    ctor: function() {
        this._super();
        cc.log("Whee!!");
        cc.log(res.shapoid_ball_png);
        this.initWithFile(res.shapoid_ball_png);
    }

});
