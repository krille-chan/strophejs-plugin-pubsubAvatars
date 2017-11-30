/*
This programm is free software under CC creative common licence!
Author: Christian Pauly
*/

/**
 * Pubsub-Avatars Plugin for strophe.js
 *
 */

(function () {

	Strophe.addConnectionPlugin('avatars', {
		OnMetadataEvent: null,
		_connection: null,


		init: function (conn) {
			this._connection = conn;
			Strophe.addNamespace('USER-AVATAR', 'urn:xmpp:avatar:data');
			Strophe.addNamespace('USER-AVATAR-METADATA', 'urn:xmpp:avatar:metadata');
		},

		statusChanged: function (status, condition) {
            if (status === Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
                this._connection.addHandler(this._onMetadataEvent.bind(this), "http://jabber.org/protocol/pubsub#event", "message");
            }
        },


		publish: function ( data, success_callback, error_callback ) {
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "id":"publish1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("publish", {"node":"urn:xmpp:avatar:data"})
			.c("item", {"id":this._connection.getUniqueId()})
			.c("data", {"xmlns":'urn:xmpp:avatar:data'})
			.t( data );
			this._connection.sendIQ(req,function(iq){
				success_callback( data );
			},function(iq){
				var text = "";
				if(iq.querySelector("text") != null)
					text = iq.querySelector("text").innerHTML;
				error_callback({
					"error" : iq,
					"reason" : iq.querySelector("error").firstChild.tagName,
					"text" : text
				});
			});
		},


		publishMetadata: function ( xmlData, succes_callback, error_callback ) {
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "id":"publish2"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("publish", {"node":"urn:xmpp:avatar:metadata"})
			.c("item", {"id":this._connection.getUniqueId()})
			.c("metadata", {"xmlns": "urn:xmpp:avatar:metadata"});
			var xmlReq = req.tree().append(xmlData);
			this._connection.sendIQ(xmlReq,function(iq){
				success_callback( xmlData );
			},function(iq){
				var text = "";
				if(iq.querySelector("text") != null)
					text = iq.querySelector("text").innerHTML;
				error_callback({
					"error" : iq,
					"reason" : iq.querySelector("error").firstChild.tagName,
					"text" : text
				});
			});
		},


		request: function ( jid, success_callback, error_callback ) {
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid( this._connection.jid ), "to": jid, "id": this._connection.getUniqueId()})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("items", {"node":"urn:xmpp:avatar:data"})
			.c("item", {"id":null});
			this._connection.sendIQ(req,function(iq){
					var avatarData = "data:image/png;base64," + iq.getElementsByTagName("data")[0].innerHTML;
					var jid = iq.getAttribute("from");
					success_callback( avatarData, jid );
				},function(iq){
					var text = "";
					if(iq.querySelector("text") != null)
						text = iq.querySelector("text").innerHTML;
					error_callback({
						"error" : iq,
						"from" : iq.getAttribute("from"),
						"reason" : iq.querySelector("error").firstChild.tagName,
						"text" : text
					});
			});
			return true;
		},


		remove: function ( success_callback, error_callback ) {
			this.publishMetadata ( "", success_callback, error_callback);
		},


		_onMetadataEvent: function ( stanza ) {

			if ( this.OnMetadataEvent != null )
				this.OnMetadataEvent ( {
					"from" : stanza.getAttribute("from"),
					"id" : stanza.querySelector("item").getAttribute("id"),
					"metadata" : stanza.querySelector("metadata")
				} );

			return true;
		},

	});

})();
