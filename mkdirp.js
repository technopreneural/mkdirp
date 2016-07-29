var fs 		= require('fs'),
	path	= require('path');

function mkdirp(newdir, callback) {
	if (!this.jobs) {
		// Initialize job queue - prevents async conflicts
		this.jobs = [newdir];
	} else {
		// Check if newdir is already in job queue
		if (0 === this.jobs.filter(function(value) {
			return value === newdir;
		}).length) {
			// If newdir is not in job queue, add it
			this.jobs.push(newdir);
		} else {
			// If newdir is already in job queue, exit.
			// This isn't necessarily an error. Run callback.
			callback();
			return;
		}
	}
	// Create new directory.
	fs.mkdir(newdir, function(err) {
		this.jobs.splice(this.jobs.findIndex(function(value) {
			return value === newdir
		}),1);
		if (err) {
			switch (err.code) {
				case 'ENOENT':
					// Parent directory does not exist.
					// Try to create parent directory first.
					mkdirp(path.parse(newdir).dir, function(err) {
						if (err) {
							callback(err);
						} else {
							// Parent directory was created successfully.
							// Try to create the new directory again.
							mkdirp(newdir, callback);
						}
					});
					break;
				default:
					// Throw an exception.
					callback(err);
			}
		} else {
			// New directory was created successfully.
			callback();
		}
	});
}

module.exports = mkdirp;