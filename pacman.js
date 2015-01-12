// ==UserScript==
// @name          PacPro
// @namespace     http://*.koalabeast.com:*
// @namespace     *tagproandluckyspammersucksandunfortunatesniperisawesome.com:*
// @version       3.0.1
// @description   Pacman mod texture pack
// @match         http://koalabeast.com
// @match         *tagproandluckyspammersucksandunfortunatesniperisawesome.com:*
// @copyright     2014+, Ly and a little bit of Cumflakes
// @include       http://*.koalabeast.com*
// @include       http://*.jukejuice.com*
// @include       http://*.newcompte.fr*
// @include       *tagproandluckyspammersucksandunfortunatesniperisawesome.com:*
// @include       http://justletme.be*
// ==/UserScript==

//Set your team color and other preferences here:
teamColor = 'blue';
opponentColor = (teamColor == 'blue') ? 'red' : 'blue'; 
tagpro.switchedColors = false;
colorId = {red:1, blue:2};
teamId = 0;

//Textures
var PACTOP = new PIXI.Texture.fromImage("http://i.imgur.com/ovzoHNE.png");
var PACBOT = new PIXI.Texture.fromImage("http://i.imgur.com/gIAt7wD.png");
var BLUEGHOST = new PIXI.Texture.fromImage("http://i.imgur.com/uQC5eVO.png");
var REDGHOST = new PIXI.Texture.fromImage("http://i.imgur.com/dvd3kh4.png");
var GHOST_TAGPRO = new PIXI.Texture.fromImage("http://i.imgur.com/U7l92W8.png");
var pacMouthMax = 15;
var pacMouthMax_JJ = 10;

tagpro.ready(function()
{
    checkTeam();

    //document.getElementById("tiles").src = "http://i.imgur.com/1n2NhRI.png";
    document.getElementById("tiles").src = "http://i.imgur.com/D2bsPhj.png";//"http://i.imgur.com/vEiGkQ3.png";//"http://i.imgur.com/fXutuKN.png";
    document.getElementById("splats").src = "http://i.imgur.com/PJHTIFB.png";
    document.getElementById("speedpad").src = "http://i.imgur.com/T1yMR4y.png";
    document.getElementById("speedpadred").src = "http://i.imgur.com/9kInsRD.png";
    document.getElementById("speedpadblue").src = "http://i.imgur.com/cnepff2.png";
    document.getElementById("portal").src = "http://i.imgur.com/a0JUw8q.png";
    
    // CORRECT SPEEDPADS
    /*document.getElementById("speedpad").src = "http://i.imgur.com/cnepff2.png";
    document.getElementById("speedpadred").src = "http://i.imgur.com/9kInsRD.png";
    document.getElementById("speedpadblue").src = "http://i.imgur.com/T1yMR4y.png";*/
    
    tr = tagpro.renderer;
    
    tr.createPacman = function(player) {
        if (player.sprites.ghost)
        {
            player.sprites.ball.removeChild(player.sprites.ghost);
            player.sprites.ghost = null;
        }

        var pacTop = new PIXI.Sprite(PACTOP);
        var pacBot = new PIXI.Sprite(PACBOT);
        pacTop.anchor = new PIXI.Point(.5, .5);
        pacBot.anchor = new PIXI.Point(.5, .5);
        pacTop.x = 20;
        pacTop.y = 20;
        pacBot.x = 20;
        pacBot.y = 20;
        
        pacTop.rotation = Math.atan2(-1,1);
        pacBot.rotation = Math.atan2(1,1);
        
        pacTop.mouthPos = pacMouthMax;
        pacTop.mouthMax = pacMouthMax;
        pacTop.closing = true;
        pacTop.flipped = false;

        player.sprites.pacTop = pacTop;
        player.sprites.pacBot = pacBot;
        player.sprites.ball.addChild(player.sprites.pacTop);
        player.sprites.ball.addChild(player.sprites.pacBot);
    }

    tr.updatePacman = function(player) {
        if(player.dead) return;
        //lx negative = left 
        //lx positive = right
        if (((player.lx < 0) && !player.sprites.pacTop.flipped) || ((player.lx > 0) && player.sprites.pacTop.flipped))
        {
            player.sprites.pacTop.scale.x *= -1;
            player.sprites.pacBot.scale.x *= -1;
            player.sprites.pacTop.flipped = !player.sprites.pacTop.flipped;
        }

        var mouthCenter = player.sprites.pacTop.flipped ? (Math.PI/4) : 0;
        player.sprites.pacTop.rotation = Math.atan2(-1, 1) * (player.sprites.pacTop.mouthPos)/player.sprites.pacTop.mouthMax + mouthCenter;
        player.sprites.pacBot.rotation = Math.atan2(1, 1) * (player.sprites.pacTop.mouthPos)/player.sprites.pacTop.mouthMax - mouthCenter;
        
        if(player.sprites.pacTop.closing)
        {
            player.sprites.pacTop.mouthPos--;
            if (player.sprites.pacTop.mouthPos <= 0)
            {
                player.sprites.pacTop.closing = false;
            }
        }
        else
        {
            player.sprites.pacTop.mouthPos++;
            if (player.sprites.pacTop.mouthPos >= player.sprites.pacTop.mouthMax)
            {
                player.sprites.pacTop.closing = true;
            }
        }
    }
    
    tr.createGhost = function(player) {

        //Player switched teams, remove the pacman sprite
        if (player.sprites.pacTop)
        {
            player.sprites.ball.removeChild(player.sprites.pacTop);
            player.sprites.ball.removeChild(player.sprites.pacBot);
            player.sprites.pacTop = null;
            player.sprites.pacBot = null;
        }

        var ghost = new PIXI.Sprite(REDGHOST);
        ghost.anchor = new PIXI.Point(.5, .5);
        ghost.x = 20;
        ghost.y = 20;
        ghost.blue = false;
        player.sprites.ghost = ghost;
        player.sprites.ball.addChild(player.sprites.ghost);

        var ghostLeftEye = new PIXI.Graphics;
        player.sprites.ghostLeftEye = ghostLeftEye;
        ghostLeftEye.beginFill(0, 1).drawCircle(11, 13, 3);
        player.sprites.ball.addChild(ghostLeftEye);


        var ghostRightEye = new PIXI.Graphics;
        player.sprites.ghostRightEye = ghostRightEye;
        ghostRightEye.beginFill(0, 1).drawCircle(23, 13, 3);
        player.sprites.ball.addChild(ghostRightEye);
    }

    tr.updateGhost = function(player){
        
        if(tagpro.players[tagpro.playerId].tagpro && !player.sprites.ghost.blue)
        {
            player.sprites.ghost.texture = BLUEGHOST;
            player.sprites.ghost.blue = true;
        }
        else if(!tagpro.players[tagpro.playerId].tagpro && player.sprites.ghost.blue)
        {
            player.sprites.ghost.texture = REDGHOST;
            player.sprites.ghost.blue = false;
        }

        var leftEye;
        var rightEye;
        var direction = Math.atan2(player.lx, player.ly)/Math.PI;
        direction = Math.round(direction * 4)/4;
        //TODO: Clean up and make pretty
        // Point Values are based on relative coordinates to the 40x40 box that the ball is contained in
        if ((player.lx == 0) && (player.ly == 0))
        {
            leftEye = new PIXI.Point(11,13);    
            rightEye = new PIXI.Point(23,13);
        }
        else if (direction == -0.75)//player.left && player.up)
        {
            leftEye = new PIXI.Point(10,11);    
            rightEye = new PIXI.Point(22,11);
        }
        else if (direction == -0.25)//player.left && player.down)
        {
            leftEye = new PIXI.Point(10,15);    
            rightEye = new PIXI.Point(22,15);
        }
        
        else if (direction == 0.75)//player.right && player.up)
        {
            leftEye = new PIXI.Point(12,11);
            rightEye = new PIXI.Point(24,11);
        }
        else if (direction == 0.25)//player.right && player.down)
        {
            
            leftEye = new PIXI.Point(12,15);    
            rightEye = new PIXI.Point(24,15);
        }
        else if(direction == -0.5)//player.left)
        {
            leftEye = new PIXI.Point(10, 13);
            rightEye = new PIXI.Point(22,13);
        }
        else if (direction == 0.5)//player.right)
        {
            leftEye = new PIXI.Point(12,13);    
            rightEye = new PIXI.Point(24,13);
        }
        else if ((direction == 1) || (direction == -1))//player.up)
        {
            leftEye = new PIXI.Point(11,10);    
            rightEye = new PIXI.Point(23,10);
        }
        else if (direction == 0)//player.down)
        {
            leftEye = new PIXI.Point(11,16);    
            rightEye = new PIXI.Point(23,16);
        }

        // Adjustments to center, not sure why exactly
        leftEye.x -= 8;
        leftEye.y -= 13;
        rightEye.x -= 20;
        rightEye.y -= 13;

        player.sprites.ghostLeftEye.position = leftEye;
        player.sprites.ghostRightEye.position = rightEye;
    }
    
    var prevUpdateSprites = tr.updatePlayerSpritePosition;
    tr.updatePlayerSpritePosition = function (player) {
        var selfPlayer = tagpro.players[tagpro.playerId];
        
        //*************** CREATE PACMAN *********************//
        if(!player.sprites.pacBot && player.team === selfPlayer.team)
        {
            tr.createPacman(player);
        }
        
        //*************** CREATE GHOST *********************//
        if(!player.sprites.ghost && player.team != selfPlayer.team)
        {
            tr.createGhost(player);
        }
        
        //*************** UPDATE PACMAN OR GHOST *********************//
        if(player.team === selfPlayer.team)
        {
            tr.updatePacman(player);
        }
        else
        {
            tr.updateGhost(player);
        }
        
        // Continue with the previously defined function
        prevUpdateSprites(player);
    };

        
    //*************** TAGPRO *********************//
    tr.updateTagpro = function (e) {
        if (e.tagpro) {
            if (!e.sprites.tagproTint) {
                if (e.sprites.ghost)
                {
                    var t = e.sprites.tagproTint = new PIXI.Sprite(GHOST_TAGPRO);
                    e.sprites.ball.addChild(t);
                }
                else
                {
                    var t = e.sprites.tagproTint = new PIXI.Graphics;
                    t.beginFill(65280, .2).lineStyle(2, 65280).drawCircle(20, 20, 19), 
                        e.sprites.ball.addChild(t);

                        // n.options.disableParticles || 
                        //     (e.sprites.tagproSparks = new cloudkid.Emitter(e.sprites.ball, [n.particleFireTexture], tagpro.particleDefinitions.tagproSparks), 
                        //         e.sprites.tagproSparks.player = e.id, n.emitters.push(e.sprites.tagproSparks))
                }
            }
        } else {
            e.sprites.tagproTint && (e.sprites.ball.removeChild(e.sprites.tagproTint), e.sprites.tagproTint = null);
            if (e.sprites.tagproSparks) {
                e.sprites.tagproSparks.emit = !1;
                var r = n.emitters.indexOf(e.sprites.tagproSparks);
                n.emitters.splice(r, 1), e.sprites.tagproSparks.destroy(), e.sprites.tagproSparks = null
            }
        }
    };

    tagpro.ui.scores = function() {
        var e = "", //redScoreString
            t = ""; //blueScoreString
        e = tagpro.switchedColors ? "Pacman - " : "Ghost - ";
        t = tagpro.switchedColors ? " - Ghost" : " - Pacman";

        var n = e + (tagpro.score.r ? tagpro.score.r.toString() : "0"),
            r = (tagpro.score.b ? tagpro.score.b.toString() : "0") + t;
        tagpro.ui.sprites.redScore ? (tagpro.ui.sprites.redScore.text != n && tagpro.ui.sprites.redScore.setText(n), tagpro.ui.sprites.blueScore != r && tagpro.ui.sprites.blueScore.setText(r)) : (tagpro.ui.sprites.redScore = new PIXI.Text(n, {
            fill: tagpro.switchedColors ? "#FFFF00" : "#FF0000",
            font: "bold 32pt Arial"
        }), tagpro.ui.sprites.blueScore = new PIXI.Text(r, {
            fill: tagpro.switchedColors ? "#FF0000" : "#FFFF00",
            font: "bold 32pt Arial"
        }), tagpro.ui.sprites.redScore.alpha = .5, tagpro.ui.sprites.blueScore.alpha = .5, 
        tagpro.ui.sprites.redScore.anchor.x = 1, tagpro.ui.sprites.blueScore.anchor.x = 0, 
        tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.redScore), 
        tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.blueScore));
    };

    tagpro.ui.largeAlert = function(e, t, n, r, i) {
        if (r.indexOf("Wins!") > -1)
        {
            if ((tagpro.winner == "red") || ((tagpro.winner == "blue") && tagpro.switchedColors))
            {
                r = "Ghosts Win!";
                i = "#FF0000";
            }
            else
            {
                r = "Pacman Wins!";
                i = "#FFFF00";
            }
        }

        var s = tagpro.renderer.largeText(r, i);
        return s.x = Math.round(t.x - s.width / 2), s.y = 100, e.addChild(s), s
    };
});

function checkTeam() {
    //wait until you'be been assigned to a team and the tiles have been loaded. 
    if (!tagpro.players[tagpro.playerId] | !tagpro.tiles) {
        return setTimeout(checkTeam,0);
    }

    //if the team color you've been assigned to is different from your preference, switch team colored tiles
    teamId = tagpro.players[tagpro.playerId].team;
    if (teamId  != colorId[teamColor]) {
        tagpro.switchedColors = true;
        switchTiles();
        // Force a redraw of the scores
        tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.redScore);
        tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.blueScore);
        tagpro.ui.sprites.redScore = null;
        tagpro.ui.sprites.blueScore = null;
    }
    // setTimeout(tagpro.renderer.drawBackground(), 0);
}

function switchTiles() {
    //store red tiles temporarily
    rFlag = tagpro.tiles[3];
    rEmptyFlag = tagpro.tiles[3.1];
    rSpeedPad = tagpro.tiles[14];
    rEmptySpeedPad = tagpro.tiles[14.1];
    rGate = tagpro.tiles[9.2];
    rZone = tagpro.tiles[17];
    rTeam = tagpro.tiles[11];
    rBall = tagpro.tiles['redball'];
    rFlag2 = tagpro.tiles['redflag'];
    
    //set red tiles equal to blue tiles
    tagpro.tiles[3] = tagpro.tiles[4];
    tagpro.tiles[3.1] = tagpro.tiles[4.1];
    tagpro.tiles[14] = tagpro.tiles[15];
    tagpro.tiles[14.1] = tagpro.tiles[15.1];
    tagpro.tiles[9.2] = tagpro.tiles[9.3];
    tagpro.tiles[17] = tagpro.tiles[18];
    tagpro.tiles[11] = tagpro.tiles[12];
    tagpro.tiles['redball'] = tagpro.tiles['blueball'];
    tagpro.tiles['redflag'] = tagpro.tiles['blueflag'];
    
    //set blue tiles equal to red tiles that were stored earlier
    tagpro.tiles[4] = rFlag;
    tagpro.tiles[4.1] = rEmptyFlag;
    tagpro.tiles[15] = rSpeedPad;
    tagpro.tiles[15.1]= rEmptySpeedPad;
    tagpro.tiles[9.3] = rGate;
    tagpro.tiles[18] = rZone;
    tagpro.tiles[12] = rTeam;
    tagpro.tiles['blueball'] = rBall;
    tagpro.tiles['blueflag'] = rFlag2;
}

