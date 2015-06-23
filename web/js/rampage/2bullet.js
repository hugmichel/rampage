Rampage.Bullet = function (game, source, target) {
  this.hitPoints = 1;
  this.sprite = game.add.sprite(source.x, source.y, 'bullet');

  game.physics.arcade.enable(this.sprite);
  this.sprite.body.velocity.x =  (target.x - source.x);
  this.sprite.body.velocity.y =  (target.y - source.y);


};
Rampage.Bullet.prototype = {
  sprite: null,
  hitPoints: null,
  update: function(rampageGame, game, players) {
    for (var i = 0; i < players.length; i++) {
      game.physics.arcade.overlap(this.sprite,
                                  players[i].sprite,
                                  function(player, thisSprite){
                                    players[i].onBulletHit();
                                    this.hitPoints--;
                                  },
                                  null, this);
      if(this.hitPoints <= 0) {
        rampageGame.removeBullet(this);
        this.sprite.destroy(true);
        break;
      }
    }
  }
};
Rampage.Bullet.preload = function (game) {
  game.load.image('bullet', 'assets/bullet.png', 2, 2);
};