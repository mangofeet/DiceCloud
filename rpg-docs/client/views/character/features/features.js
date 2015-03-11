Template.features.helpers({
	features: function(){
		var features = Features.find({charId: this._id}, {sort: {color: 1, name: 1}});
		return features;
	},
	hasUses: function(){
		return this.usesValue() > 0;
	},
	noUsesLeft: function(){
		return this.usesLeft() <= 0;
	},
	usesFull: function(){
		return this.usesLeft() >= this.usesValue();
	},
	colorClass: function(){
		return getColorClass(this.color)
	},
	featureOrder: function(){
		return _.indexOf(_.keys(colorOptions), this.color);
	},
	attacks: function(){
		return Attacks.find({charId: this._id, enabled: true}, {sort: {color: 1, name: 1}});
	},
	characterProficiencies: function(){
		var char = Characters.findOne(this._id);
		return char && char.proficiencies;
	},
	canEnable: function(){
		return this.enabled !== "alwaysEnabled";
	},
	isEnabled: function(){
		return this.enabled !== "disabled";
	}
});

Template.features.events({
	"tap #addFeature": function(event){
		var featureId = Features.insert({name: "New Feature", charId: this._id});
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: this._id},
			heroId:   featureId
		})
	},
	"tap #addAttackButton": function(event){
		var charId = this._id;
		Attacks.insert({
			charId: charId
		}, function(error, id){
			if(!error){
				GlobalUI.setDetail({
					template: "attackDialog",
					data:     {attackId: id, charId: charId},
					heroId:   id
				});
			}
		});
	},
	"tap .featureCard .containerTop": function(event){
		var featureId = this._id;
		var charId = Template.parentData()._id;
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: charId},
			heroId:   featureId
		});
	},
	"tap .attack": function(event){
		var attackId = this._id;
		var charId = Template.parentData()._id;
		GlobalUI.setDetail({
			template: "attackDialog",
			data:     {attackId: attackId, charId: charId},
			heroId:   attackId
		});
	},
	"tap .useFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$inc: {used: 1}});
	},
	"tap .resetFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$set: {used: 0}});
	},
	"tap #proficiencies": function(event){
		var charId = this._id;
		GlobalUI.setDetail({
			template: "textDialog",
			data:     {charId: charId, field: "proficiencies", title: "Proficiencies", color: "q"},
			heroId:   this._id + "proficiencies"
		});
	},
	"tap .enabledCheckbox": function(event){
		event.stopPropagation();
	},
	"change .enabledCheckbox": function(event){
		var enabled;
		if(this.enabled === "enabled") enabled = "disabled";
		else enabled = "enabled";
		Features.update(this._id, {$set: {enabled: enabled}});
	}
});

Template.resource.helpers({
	cantIncrement: function(){
		return !(this.char.attributeValue(this.name) < this.char.attributeBase(this.name));
	},
	cantDecrement: function(){
		return !(this.char.attributeValue(this.name) > 0);
	},
	getColor: function(){
		if(this.char.attributeValue(this.name) > 0){
			return this.color;
		} else {
			return "grey";
		}
	}
});

Template.resource.events({
	"tap .resourceUp": function(event){
		if(this.char.attributeValue(this.name) < this.char.attributeBase(this.name)){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .resourceDown": function(event){
		if(this.char.attributeValue(this.name) > 0){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	}
});
