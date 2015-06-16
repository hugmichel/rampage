Rampage.Building = function (totalHitPoints) {
  this.totalHitPoints = totalHitPoints | 0;
  this.hitPoints = this.totalHitPoints;
};
Rampage.Building.prototype = {
  buildingGroup: null,
  PART_HEIGHT: 64,
  PART_WIDTH: 64,

  hitPoints: 0,
  totalHitPoints: 0,

  create: function (game, xRoot, yRoot, width, height) {

    // -- buildings
    this.buildingGroup = game.add.group();
    this.buildingGroup.enableBody = true;

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var buildingPart = this.buildingGroup.create(xRoot + (this.PART_WIDTH * x),
                                                     yRoot - (this.PART_HEIGHT * (y + 1)),
                                                     'building',
                                                     y == 0 ? 2 : 1);
        buildingPart.width = this.PART_WIDTH;
        buildingPart.height = this.PART_HEIGHT;
        buildingPart.body.gravity.y = 100;
      }

    }
    game.physics.arcade.enable(this.buildingGroup);
  },
  update: function (game, platforms) {
    if (this.hitPoints > 0) {
      game.physics.arcade.collide(this.buildingGroup, platforms);
    }
    game.physics.arcade.collide(this.buildingGroup, this.buildingGroup);
  },
  onStrike: function(){
    console.log('onStrike');
    this.hitPoints = Math.max(this.hitPoints - 1, 0);
    this.buildingGroup.tint = 0xFFFFFF * (this.hitPoints / this.totalHitPoints);
  }
};