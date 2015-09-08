'use strict';
console.log('------------- calc -------------');

// ---------- Dataset for calc a family consumption  ---------- //
var dataset = {
	// Table Q of user and his % for profile
	qOfUsers: [
		{basic: 2, medium: 6, high: 12},
		{basic: 2, medium: 7, high: 14},
		{basic: 3, medium: 8, high: 16},
		{basic: 3, medium: 8, high: 18},
		{basic: 4, medium: 9, high: 20},
		{basic: 4, medium: 10, high: 22},
		{basic: 4, medium: 11, high: 24},
		{basic: 5, medium: 12, high: 26},
		{basic: 5, medium: 12, high: 28},
		{basic: 6, medium: 13, high: 30}
	],
	// Table with the max value (250gb) in GB and Q
	maxValues: {
		basic: {
			q: [13107, 5120, 4864, 1280, 640, 0, 0],
			gb: [3, 75, 95, 75, 3, 0, 0]
		},
		medium: {
			q: [26214, 2389, 2176, 853, 1280, 114, 640],
			gb: [5, 35, 43, 50, 5, 100, 13]
		},
		high: {
			q: [26214, 1365, 1024, 469, 1920, 171, 1024],
			gb: [5, 20, 20, 28, 8, 150, 20]
		}
	},
	// Conversion table in GB
	conversion: [0.000190735, 0.01464844, 0.00047684, 0.0585937, 0.00488281, 0.00390625 , 0.87890625, 0.01953125]
};

// Constructor of family data for use in D3
var familyData = {
	createProfile: function(setting) {
		return this.profile = setting.profile;
	},
	consumptionTotal: function(setting, users) {
		var disp = users[setting.numOfDisp -1];
		var total = (disp.basic/100 * setting.basicUser + disp.medium/100 * setting.mediumUser + disp.high/100 * setting.highUser)*250;
		// I validate if the total is less than 250gb
		return this.total = total > 250 ? 250 : Math.floor(total);
	},
	consumptionList: function(values){
		var user = values[this.profile];
		var list = {q: [], gb: []};
		// Construct the arrays
		for(var i = 0; i < user.q.length; i++) {
			list.q.push(Math.floor(user.q[i] * (this.total/250)));
			list.gb.push(Math.round((user.gb[i] * (this.total/250)) * 10 ) / 10);
		}
		return this.list = list;
	},
	createMessages: function() {
		var i = 0;
		var messagesList = {};
		var messages = {
			mail: 'mails equivalen a',
			web: 'minutos en la web equivalen a',
			social: 'posts en redes sociales equivalen a',
			music: 'minutos de streaming de música equivalen a',
			chat: 'minutos de video llamadas equivalen a',
			video: 'minutos de streaming de video equivalen a',
			games: 'minutos de juegos online equivalen a'
		};
		// Create simple base message
		messagesList.base = {
			number: [this.total],
			string: ['GB de uso mensual']
		};
		// Create all the other messages
		for(var message in messages) {
			messagesList[message] = {
				number: [this.list.q[i], this.list.gb[i]],
				string: [messages[message], 'GB de consumo']
			};
			i++;
		}
		return this.messages = messagesList;
	},
	createData: function(setting, dataset) {
		this.createProfile(setting);
		this.consumptionTotal(setting, dataset.qOfUsers);
		this.consumptionList(dataset.maxValues);
		this.createMessages();
		return this;
	}
};