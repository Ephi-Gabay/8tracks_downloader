var eightHacks = (function() {
    
    var playlistId, playlistName, playlistSongsCount;
    var downloadedSongs = 0;
    var tokenId = Math.round(Math.random() * 1000000000);
    var files = [];
    
    var error = function(message) {
        console.log(message);    
    }
    
    var log = function(message) {
        console.log(message);   
    }
    
    var downloadPlaylist = function() {
        var playlistUrl = $("#playlist_url").val();
        getPlaylistInfo(playlistUrl, function() {
            getJson(completeDownload);
        });
    
    }
    
    var completeDownload = function() {
        files.forEach(function(file) {
            $("#songs").append("<li>"+ file.name + " by " + file.performer +", link: " + file.track_file_stream_url + "</li>");
        });
    }
    
    var getPlaylistId = function(html) {
        var playlistIdRegexResults = /mixes\/(\d+)\/player_v3/.exec(html);
        if(!playlistIdRegexResults || playlistIdRegexResults.length < 2) {
            error("Could not find playlist ID");
            return null;
        }
        log("Got playlist ID");
        return playlistIdRegexResults[1];
    }
    
    var getPlaylistName = function(html) {
       var playlistIdRegexResults = /"name":"([^"]+)"/.exec(html);
        if(!playlistIdRegexResults || playlistIdRegexResults.length < 2) {
            error("Could not find playlist name");
            return null;
        }
        log("Got playlist name");
        return playlistIdRegexResults[1]; 
    }
    
    var getPlaylistSongsCount = function(html) {
       var playlistIdRegexResults = /"tracks_count":(\d+)/.exec(html);
        if(!playlistIdRegexResults || playlistIdRegexResults.length < 2) {
            error("Could not find playlist songs count");
            return null;
        }
        log("Got playlist songs count");
        return parseInt(playlistIdRegexResults[1]); 
    }
    
    var getPlaylistInfo = function(url, callback) {
        log("Getting playlist Info");
        $.get(url, function(html) {
            
            playlistId = getPlaylistId(html);
            platlistName = getPlaylistName(html);
            playlistSongsCount = getPlaylistSongsCount(html);
            
            callback();
                        
        });
    }
    
    var generateFileName = function(name, performer, ext) {
        var newName = performer.replace(/[^a-zA-Z0-9_\-]/g, "_") + "_" + name.replace(/[^a-zA-Z0-9_\-]/g, "_") + ext;
        return newName;
    }
    
    var generateUrl = function(songId) {
        if(!songId) {
            return "http://8tracks.com/sets/"+ tokenId + "/play?player=sm&mix_id="+ playlistId +"&format=jsonh";
        }
        else {
            return "http://8tracks.com/sets/"+ tokenId +"/next?player=sm&mix_id=" + playlistId + "&track_id=" + songId + "&format=jsonh"    
        }
    }
    
    var getJson = function(downloadCompleteCallback, songId) {
        $.getJSON(generateUrl(songId), function(data) {
            
            if(data.notices && data.notices != "") {
                error(data.notices);
                return;
            }
            
            if(data.set.at_end) {
                downloadCompleteCallback();
                return;
            }
            
            var fileExtension = "m4a";
            if(data.set.track.track_file_stream_url.indexOf("api.soundcloud") > -1) {
                fileExtension = "mp3"; 
            }
            
            
            var fileName = generateFileName(data.set.track.name, data.set.track.performer, fileExtension);
            
            files.push(data.set.track);
            downloadedSongs++;
            
            getJson(downloadCompleteCallback, data.set.track.id);    
        });
    }
    
    return {
        downloadPlaylist: downloadPlaylist   
    }
})();