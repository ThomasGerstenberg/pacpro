// ==UserScript==
// @name          PacPro
// @namespace     http://*.koalabeast.com:*
// @version       3.0.1
// @description   Pacman mod texture pack
// @copyright     2015+, moose.
// @require       https://gist.githubusercontent.com/SomeBall-1/80320c9db3e1146c0a66/raw/TagPro%20Texture%20Refresh.js
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

// TILES
var TilesRegular = "http://i.imgur.com/D2bsPhj.png";
var TilesSwapped = "http://i.imgur.com/lLH88hb.png";

//Textures
var PACTOP = new PIXI.Texture.fromImage("http://i.imgur.com/ovzoHNE.png");
var PACBOT = new PIXI.Texture.fromImage("http://i.imgur.com/gIAt7wD.png");
var BLUEGHOST = new PIXI.Texture.fromImage("http://i.imgur.com/uQC5eVO.png");
var REDGHOST = new PIXI.Texture.fromImage("http://i.imgur.com/dvd3kh4.png");
var GHOST_TAGPRO = new PIXI.Texture.fromImage("http://i.imgur.com/U7l92W8.png");
var pacMouthMax = 15;
var pacMouthMax_JJ = 9;


tagpro.ready(function()
{
    document.getElementById("tiles").src = TilesRegular;
    document.getElementById("splats").src = "http://i.imgur.com/PJHTIFB.png";
    document.getElementById("speedpad").src = "http://i.imgur.com/xNYdOYD.png";
    document.getElementById("speedpadred").src = "http://i.imgur.com/2pbrSjq.png";
    document.getElementById("speedpadblue").src = "http://i.imgur.com/tbz0xgb.png";
    document.getElementById("portal").src = "http://i.imgur.com/a0JUw8q.png";
    document.getElementById("ballpopred").src = "http://i.imgur.com/31srn9r.png";
    document.getElementById("ballpopblue").src = "http://i.imgur.com/HGvXAsC.png";
    
    checkTeam();
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
        s = player.sprites;

        if (((player.lx < 0) && !s.pacTop.flipped) || ((player.lx > 0) && s.pacTop.flipped))
        {
            s.pacTop.scale.x *= -1;
            s.pacBot.scale.x *= -1;
            s.pacTop.flipped = !s.pacTop.flipped;
        }

        if (player.grip && s.pacTop.mouthMax != pacMouthMax_JJ)
        {
            s.pacTop.mouthMax = pacMouthMax_JJ;
            if (s.pacTop.mouthPos >= pacMouthMax_JJ)
            {
                s.pacTop.mouthPos = pacMouthMax_JJ;
                s.pacTop.closing = true;
            }
        }
        else if (!player.grip && s.pacTop.mouthMax != pacMouthMax)
        {
            s.pacTop.mouthMax = pacMouthMax;
        }

        var mouthCenter = s.pacTop.flipped ? (Math.PI/4) : 0;
        s.pacTop.rotation = Math.atan2(-1, 1) * (s.pacTop.mouthPos)/s.pacTop.mouthMax + mouthCenter;
        s.pacBot.rotation = Math.atan2(1, 1) * (s.pacTop.mouthPos)/s.pacTop.mouthMax - mouthCenter;
        
        if(s.pacTop.closing)
        {
            s.pacTop.mouthPos--;
            if (s.pacTop.mouthPos <= 0)
            {
                s.pacTop.closing = false;
            }
        }
        else
        {
            s.pacTop.mouthPos++;
            if (s.pacTop.mouthPos >= s.pacTop.mouthMax)
            {
                s.pacTop.closing = true;
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
        else if (direction == -0.75)// up left
        {
            leftEye = new PIXI.Point(10,11);    
            rightEye = new PIXI.Point(22,11);
        }
        else if (direction == -0.25)// down left
        {
            leftEye = new PIXI.Point(10,15);    
            rightEye = new PIXI.Point(22,15);
        }
        
        else if (direction == 0.75)// up right
        {
            leftEye = new PIXI.Point(12,11);
            rightEye = new PIXI.Point(24,11);
        }
        else if (direction == 0.25)// down right
        {
            
            leftEye = new PIXI.Point(12,15);    
            rightEye = new PIXI.Point(24,15);
        }
        else if(direction == -0.5)// left
        {
            leftEye = new PIXI.Point(10, 13);
            rightEye = new PIXI.Point(22,13);
        }
        else if (direction == 0.5)// right
        {
            leftEye = new PIXI.Point(12,13);    
            rightEye = new PIXI.Point(24,13);
        }
        else if ((direction == 1) || (direction == -1))// up
        {
            leftEye = new PIXI.Point(11,10);    
            rightEye = new PIXI.Point(23,10);
        }
        else if (direction == 0)// down
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

    tr.drawSplat = function(e, t, r, i, s) {
        tr.drawBallPop(e + 19, t + 19, r);
    }

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

        }
        setTimeout(checkSwitchTeam, 5000);
    }

    function switchTiles() {
        rspeed = document.getElementById("speedpadred").src;
        document.getElementById("speedpadred").src = document.getElementById("speedpadblue").src;
        document.getElementById("speedpadblue").src = rspeed;

        rpop = document.getElementById("ballpopred").src;
        document.getElementById("ballpopred").src = document.getElementById("ballpopblue").src;
        document.getElementById("ballpopblue").src = rpop;

        if (tagpro.switchedColors)
        {
            document.getElementById("tiles").src = TilesSwapped;
        }
        else
        {
            document.getElementById("tiles").src = TilesRegular;
        }

        // Force a redraw of the scores
        tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.redScore);
        tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.blueScore);
        tagpro.ui.sprites.redScore = null;
        tagpro.ui.sprites.blueScore = null;

        setTimeout(refreshTextures, 100);
    }

    function refreshTextures() {
        if (!tagpro.renderer.refresh) {
            return setTimeout(refreshTextures, 10);
        }
        window.requestAnimationFrame(tagpro.renderer.refresh);
    }

    function checkSwitchTeam(){
        if (teamId != tagpro.players[tagpro.playerId].team)
        {
            console.log("Switching Teams");
            teamId = tagpro.players[tagpro.playerId].team;
            tagpro.switchedColors = !tagpro.switchedColors;
            switchTiles();
        }
        setTimeout(checkSwitchTeam, 1000);
    }
});