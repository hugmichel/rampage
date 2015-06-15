Rampage.Building = function () {

};
Rampage.Building.prototype = {
  buildingGroup: null,
  create: function (game, xRoot, yRoot, width, height) {

    // -- buildings
    this.buildingGroup = game.add.group();
    this.buildingGroup.enableBody = true;

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var buildingPart = this.buildingGroup.create(xRoot + (50 * x),
                                                     yRoot - (50 * y),
                                                     'ground');
        buildingPart.height = 50;
        buildingPart.width = 50;
        buildingPart.body.gravity.y = 100;
      }
//        var buildingPart = this.platforms.create(100 + (10 * x) + (50 * x),
//                                                 this.game.world.height - 64 - (10 * y) - (50 * y),
//                                                 'ground');
//        buildingPart.height = 10;
//        buildingPart.width = 50;
//        buildingPart.body.gravity.y = 100;
//        buildingPart.body.immovable = true;
//        this.platforms.push(buildingPart);
    }
    game.physics.arcade.enable(this.buildingGroup);

  },
  update: function (game) {

    game.physics.arcade.collide(this.buildingGroup, this.buildingGroup);
  }
};