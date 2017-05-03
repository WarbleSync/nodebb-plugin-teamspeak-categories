<form role="form" class="teamspeakcategories-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Teamspeak / NodeBB</div>
		<div class="col-sm-10 col-xs-12">
			<p class="lead">
				Please enter your Teamspeak server settings below:
			</p>
			<div class="form-group">
				<label for="serverip">Teamspeak Server IP</label>
				<input type="text" id="serverip" name="serverip" title="Teamspeak Server IP" class="form-control" placeholder="Your Teamspeak Server IP">
			</div>
			<div class="form-group">
				<label for="queryport">Teamspeak Server Query Port</label>
				<input type="number" id="queryport" name="queryport" title="Teamspeak Server Query Port" class="form-control" placeholder="Teamspeak Server Query Port">
			</div>
			<div class="form-group">
				<label for="vid">Teamspeak Virtual Server Id</label>
				<input type="text" id="vid" name="vid" title="Teamspeak Virtual Server Id" class="form-control" placeholder="Teamspeak Virtual Server Id">
			</div>
			<div class="form-group">
				<label for="username">Teamspeak Username</label>
				<input type="text" id="username" name="username" title="Teamspeak Username" class="form-control" placeholder="Teamspeak Username">
			</div>
			<div class="form-group">
				<label for="password">Teamspeak Password</label>
				<input type="text" id="password" name="password" title="Teamspeak Password" class="form-control" placeholder="Teamspeak Password">
			</div>
		</div>
	</div>
	<br/>
	<div class="row">
		<div class="col-sm-2 col-xs-12"></div>
		<div class="col-sm-10 col-xs-12">
			<!-- IF categories.length -->
				<p class="lead">
					Pair your categories and channels below:
				</p>
				<!-- BEGIN categories -->
					<div class="form-group">
						<label for="category_{categories.cid}">{categories.name}</label>
						<!-- IF ts_channels.length -->
						<select id="category_{categories.cid}" class="form-control" name="category_{categories.cid}">
							<option value="">None</option>
							<!-- BEGIN ts_channels -->
							<option value="cid_{ts_channels.cid}">{ts_channels.channel_name}</option>
							<!-- END ts_channels -->
					  </select>
						<!-- END ts_channels.length -->
					</div>
				<!-- END categories -->
			<!-- ENDIF categories.length -->
		</div>
	</div>
</form>

<!-- <div class="row">
	<div class="col-sm-2 col-xs-12"></div>
	<div class="col-sm-10 col-xs-12">
		<label for="updateTS">Refresh Channels</label>
		<button id="updateTS" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--colored">
			<i class="material-icons">refresh</i>
		</button>
	</div>
</div> -->


<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>
