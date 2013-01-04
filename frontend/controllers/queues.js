
var redisq = require('../../');

module.exports.list = function(req, res) {
	redisq.getStats(function(err, stats) {
		res.send(stats);
	});
};

module.exports.show = function(req, res) {
	var name = req.params.name;

	redisq.hasQueue(name, function(err, exists) {
		if (exists) {
			redisq.queue(name).stats(function(err, stats) {
				res.render("queue", {
					found: true,
					name:  name,
					stats: stats
				});
			});
		} else {
			res.render("queue", { found: false, name: name });
		}
	});
};

module.exports.purge = function(req, res) {
	var name = req.params.name;

	redisq.hasQueue(name, function(err, exists) {
		if (exists) {
			redisq.queue(name).purge(function(err, status) {
				res.send({ "status": "ok" });
			});
		} else {
			res.send({ "status": "notfound" });
		}
	});
};

module.exports.history = function(req, res) {
	var name = req.params.name;

	redisq.hasQueue(name, function(err, exists) {
		if (exists) {
			redisq.queue(name).stats(function(err, stats) {
				var result = {
					"processed": [],
					"failed":    [],
					"queued":    []
				};

				stats.history.map(function(row) {
					result.processed.push([row.createdAt * 1000, row.processed]);
					result.failed.push([row.createdAt * 1000, row.failed]);
					result.queued.push([row.createdAt * 1000, row.queued]);
				});

				res.send(JSON.stringify(result));
			});
		} else {
			res.send({ "status": "notfound" });
		}
	});
};
