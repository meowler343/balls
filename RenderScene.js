renderer = {
	init: function()
	{
		this.a=1;
		this.r=39;
		this.vd=0.95 ;
		this.g=3;
		this.deviceTilt={x:0,y:0.1};
		this.air_res=0;
		this.adding_mode=0;
		this.touch_mode=0;
		
		// Эффекты неона
		this.glow = 15;
		this.rgb_mode = false;
		this.hue = 0;
		this.particles = [];
		
		// Режим разрушаемых блоков
		this.draw_block_mode = false;
		this.blocks = [];

		// Режим чёрных дыр / воронки
		this.draw_vortex_mode = false;
		this.blackHoles = [];
		
		this.touched_ball=[];
		this.touch_x=[];
		this.touch_y=[];
		this.touch_x_1=[];
		this.touch_y_1=[];
		
		this.x=[];
		this.y=[];
		this.Vx=[];
		this.Vy=[];
		this.ball_mode=[];
		
		for(var i=0;i<10;i++)
			this.touched_ball[i]=-1;
		
		this.num=10;
		
		for (var i=0; i<this.num; i++) {
			this.x[i]=Math.random()*canvas.width;
			this.y[i]=Math.random()*canvas.height;
			this.Vx[i]=-10+10*Math.random();
			this.Vy[i]=-10+10*Math.random();
			this.ball_mode[i]=0;
		}
		this.DeltaT=0.1;
	},

	accelerometer: function(acceleration)
	{
		this.deviceTilt.x = -0.1*acceleration.x;
		this.deviceTilt.y = 0.1*acceleration.y;
	},
	
	render: function()
	{
		if (this.rgb_mode) {
			this.hue = (this.hue + 1) % 360;
		}

		ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		this.updateAndDrawBlackHoles();
		this.drawBlocks();
		this.checkBlockCollisions();
		this.Picture();
		this.updateAndDrawParticles();
	},

	addBlackHole: function(x, y)
	{
		for (var i = 0; i < this.blackHoles.length; i++) {
			var bh = this.blackHoles[i];
			var dist = Math.sqrt((bh.x - x)*(bh.x - x) + (bh.y - y)*(bh.y - y));
			if (dist < 30) {
				this.blackHoles.splice(i, 1);
				return;
			}
		}
		this.blackHoles.push({ x: x, y: y, radius: 25, power: 18, angle: 0 });
	},

	clearBlackHoles: function()
	{
		this.blackHoles = [];
	},

	updateAndDrawBlackHoles: function()
	{
		for (var bh = 0; bh < this.blackHoles.length; bh++) {
			var hole = this.blackHoles[bh];
			hole.angle += 0.05;

			// Применяем физику притягивания к шарам
			for (var i = 0; i < this.num; i++) {
				if (this.ball_mode[i] === 1) continue; // Не притягиваем фиксированные
				
				var dx = hole.x - this.x[i];
				var dy = hole.y - this.y[i];
				var distSq = dx * dx + dy * dy;
				var dist = Math.sqrt(distSq);

				if (dist > 5) {
					var force = (hole.power * 120) / (distSq + 500);
					// Прямое притяжение к центру
					this.Vx[i] += (dx / dist) * force;
					this.Vy[i] += (dy / dist) * force;
					
					// Тангенциальная сила (эффект закручивающегося вихря)
					this.Vx[i] += (-dy / dist) * force * 0.35;
					this.Vy[i] += (dx / dist) * force * 0.35;
				}
			}

			// Отрисовка чёрной дыры
			var mainColor = this.rgb_mode ? "hsl(" + ((this.hue + 180) % 360) + ", 100%, 50%)" : "#b000ff";
			
			ctx.save();
			ctx.translate(hole.x, hole.y);

			// Внешний светящийся диск
			ctx.beginPath();
			ctx.arc(0, 0, hole.radius, 0, Math.PI * 2);
			ctx.strokeStyle = mainColor;
			ctx.lineWidth = 3;
			ctx.shadowColor = mainColor;
			ctx.shadowBlur = this.glow + 10;
			ctx.stroke();

			// Закручивающиеся неоновые спирали
			ctx.rotate(hole.angle);
			for (var s = 0; s < 3; s++) {
				ctx.rotate((Math.PI * 2) / 3);
				ctx.beginPath();
				ctx.arc(0, 0, hole.radius * 0.65, 0, Math.PI * 0.7);
				ctx.lineWidth = 2;
				ctx.strokeStyle = "#00ffff";
				ctx.stroke();
			}

			// Тёмное ядро (Горизонт событий)
			ctx.beginPath();
			ctx.arc(0, 0, hole.radius * 0.4, 0, Math.PI * 2);
			ctx.fillStyle = "#000000";
			ctx.shadowBlur = 0;
			ctx.fill();
			ctx.strokeStyle = mainColor;
			ctx.lineWidth = 1.5;
			ctx.stroke();

			ctx.restore();

			// Эффект засасывания внешних частиц в воронку
			if (Math.random() < 0.4) {
				var a = Math.random() * Math.PI * 2;
				var r = hole.radius + 15 + Math.random() * 25;
				this.particles.push({
					x: hole.x + Math.cos(a) * r,
					y: hole.y + Math.sin(a) * r,
					vx: -Math.cos(a) * 2 - Math.sin(a) * 2,
					vy: -Math.sin(a) * 2 + Math.cos(a) * 2,
					color: mainColor,
					alpha: 0.8,
					size: 1.5
				});
			}
		}
	},

	addBlock: function(x, y)
	{
		var w = 40, h = 20;
		var bx = Math.floor((x - w/2) / 10) * 10;
		var by = Math.floor((y - h/2) / 10) * 10;
		
		for (var i = 0; i < this.blocks.length; i++) {
			var b = this.blocks[i];
			if (Math.abs(b.x - bx) < w && Math.abs(b.y - by) < h) {
				return;
			}
		}
		
		var color = this.rgb_mode ? "hsl(" + ((this.hue + 60) % 360) + ", 100%, 50%)" : "#ff0055";
		this.blocks.push({ x: bx, y: by, w: w, h: h, hp: 3, maxHp: 3, color: color });
	},

	clearBlocks: function()
	{
		this.blocks = [];
	},

	drawBlocks: function()
	{
		for (var i = 0; i < this.blocks.length; i++) {
			var b = this.blocks[i];
			var alpha = b.hp / b.maxHp;
			ctx.save();
			ctx.beginPath();
			ctx.rect(b.x, b.y, b.w, b.h);
			ctx.fillStyle = b.color;
			ctx.globalAlpha = alpha;
			ctx.shadowColor = b.color;
			ctx.shadowBlur = this.glow;
			ctx.fill();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = "#ffffff";
			ctx.stroke();
			ctx.restore();
		}
	},

	checkBlockCollisions: function()
	{
		for (var b = this.blocks.length - 1; b >= 0; b--) {
			var block = this.blocks[b];
			for (var i = 0; i < this.num; i++) {
				var bx = this.x[i];
				var by = this.y[i];
				var r = this.r;
				
				var closestX = Math.max(block.x, Math.min(bx, block.x + block.w));
				var closestY = Math.max(block.y, Math.min(by, block.y + block.h));
				
				var distX = bx - closestX;
				var distY = by - closestY;
				var distanceSquared = (distX * distX) + (distY * distY);
				
				if (distanceSquared < r * r) {
					var dist = Math.sqrt(distanceSquared) || 0.1;
					var overlap = r - dist;
					
					if (Math.abs(distX) > Math.abs(distY)) {
						this.Vx[i] = -this.Vx[i] * this.vd;
						this.x[i] += (distX / dist) * overlap;
					} else {
						this.Vy[i] = -this.Vy[i] * this.vd;
						this.y[i] += (distY / dist) * overlap;
					}
					
					block.hp--;
					var impactForce = Math.sqrt(this.Vx[i]*this.Vx[i] + this.Vy[i]*this.Vy[i]) + 2;
					this.spawnSparks(closestX, closestY, impactForce * 2);
					
					if (block.hp <= 0) {
						this.spawnSparks(block.x + block.w/2, block.y + block.h/2, 18);
						this.blocks.splice(b, 1);
						break;
					}
				}
			}
		}
	},

	spawnSparks: function(x, y, intensity)
	{
		var sparkCount = Math.min(Math.floor(intensity * 2), 25);
		var color = this.rgb_mode ? "hsl(" + this.hue + ", 100%, 70%)" : "#fff";
		for (var k = 0; k < sparkCount; k++) {
			var angle = Math.random() * Math.PI * 2;
			var speed = 1 + Math.random() * intensity * 0.6;
			this.particles.push({
				x: x,
				y: y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				color: color,
				alpha: 1.0,
				size: 1.5 + Math.random() * 2.5
			});
		}
	},

	updateAndDrawParticles: function()
	{
		for (var p = this.particles.length - 1; p >= 0; p--) {
			var pt = this.particles[p];
			pt.x += pt.vx;
			pt.y += pt.vy;
			pt.alpha -= 0.03;
			
			if (pt.alpha <= 0) {
				this.particles.splice(p, 1);
				continue;
			}
			
			ctx.beginPath();
			ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
			ctx.fillStyle = pt.color;
			ctx.globalAlpha = Math.max(0, pt.alpha);
			ctx.shadowColor = pt.color;
			ctx.shadowBlur = this.glow;
			ctx.fill();
			ctx.globalAlpha = 1.0;
			ctx.shadowBlur = 0;
		}
	},

	Picture: function()
	{
		for (var i=0; i<10; i++) {
			if (this.touched_ball[i]>=0) {
				this.touch_x_1[i]=this.touch_x[i];
				this.touch_y_1[i]=this.touch_y[i];
				if (this.ball_mode[this.touched_ball[i]]!=1) {
					this.Vx[this.touched_ball[i]]=-0.5*(this.x[this.touched_ball[i]]-this.touch_x_1[i])/this.DeltaT/10.0;
					this.Vy[this.touched_ball[i]]=-0.5*(this.y[this.touched_ball[i]]-this.touch_y_1[i])/this.DeltaT/10.0;
				}
				else
				{
					this.x[this.touched_ball[i]]=this.touch_x[i];
					this.y[this.touched_ball[i]]=this.touch_y[i];
				}
			}
		}
		for (var t=0; t<10; t++) {
			for (var i=0; i<this.num; i++) {
				if (this.ball_mode[i]!=1)
				{
					this.x[i]+=this.Vx[i]*this.DeltaT;
					this.y[i]+=this.Vy[i]*this.DeltaT;
				}
				else
				{
					this.Vx[i]=0;
					this.Vy[i]=0;
				}
				var deltaX,deltaY;
				if (this.ball_mode[i]==3 && i!=0) {
					deltaX=this.x[i]-this.x[i-1];
					deltaY=this.y[i]-this.y[i-1];
					this.Vx[i]-=0.3/this.r*(deltaX-2*this.r*deltaX/Math.sqrt(deltaX*deltaX+deltaY*deltaY));
					this.Vy[i]-=0.3/this.r*(deltaY-2*this.r*deltaY/Math.sqrt(deltaX*deltaX+deltaY*deltaY));
				}
				if (this.ball_mode[i]!=1 && i!=this.num-1 && this.ball_mode[i+1]==3) {
					deltaX=this.x[i]-this.x[i+1];
					deltaY=this.y[i]-this.y[i+1];
					this.Vx[i]-=0.3/this.r*(deltaX-2*this.r*deltaX/Math.sqrt(deltaX*deltaX+deltaY*deltaY));
					this.Vy[i]-=0.3/this.r*(deltaY-2*this.r*deltaY/Math.sqrt(deltaX*deltaX+deltaY*deltaY));
				}
				
				this.Vx[i]-=this.Vx[i]*this.air_res;
				this.Vy[i]-=this.Vy[i]*this.air_res;
				
				if (this.x[i]>canvas.width-this.r) {
					this.Vx[i]=-this.Vx[i]*this.vd;
					this.x[i]=canvas.width-this.r;
				}
				else if(this.x[i]<this.r)
				{
					this.Vx[i]=-this.Vx[i]*this.vd;
					this.x[i]=this.r;
				}
				if (this.y[i]>canvas.height-this.r) {
					this.Vy[i]=-this.Vy[i]*this.vd;
					this.y[i]=canvas.height-this.r;
				}
				else if(this.y[i]<this.r)
				{
					this.Vy[i]=-this.Vy[i]*this.vd;
					this.y[i]=this.r;
				}
			}
			this.CheckDistance();
		}

		var lineColor = this.rgb_mode ? "hsl(" + ((this.hue + 240) % 360) + ", 100%, 50%)" : "#0f0";
		var springColor = this.rgb_mode ? "hsl(" + ((this.hue + 180) % 360) + ", 100%, 50%)" : "#ff0";

		for(var i=0;i<this.num;i++)
		{
			if (this.ball_mode[i]!=1) {
				this.Vx[i]+=this.deviceTilt.x*this.g;
				this.Vy[i]+=this.deviceTilt.y*this.g;
			}
			switch (this.ball_mode[i]) {
				case 0:
					this.drawBall(this.x[i],this.y[i]);
					break;
				case 1:
					this.drawBall1(this.x[i],this.y[i]);
					break;
				case 2:
					this.drawBall(this.x[i],this.y[i]);
					if (i!=0) {
						ctx.strokeStyle=lineColor;
						ctx.shadowColor=lineColor;
						ctx.shadowBlur=this.glow;
						this.drawLine(this.x[i-1],this.y[i-1],this.x[i],this.y[i]);
						ctx.shadowBlur=0;
					}
					break;
				case 3:
					this.drawBall(this.x[i],this.y[i]);
					if (i!=0) {
						ctx.strokeStyle=springColor;
						ctx.shadowColor=springColor;
						ctx.shadowBlur=this.glow;
						this.drawLine(this.x[i-1],this.y[i-1],this.x[i],this.y[i]);
						ctx.shadowBlur=0;
					}
					break;
			}
		}
	},

	CalVelocity: function(i,j)
	{
		var dx=this.x[i]-this.x[j],dy=this.y[i]-this.y[j];
		var dr=dx*dx+dy*dy;
		var V1x,V1y,V2x,V2y;
		if (dr!=0) {
			var relVx = this.Vx[i] - this.Vx[j];
			var relVy = this.Vy[i] - this.Vy[j];
			var impactForce = Math.sqrt(relVx * relVx + relVy * relVy);

			if (impactForce > 2.0) {
				var cx = (this.x[i] + this.x[j]) / 2;
				var cy = (this.y[i] + this.y[j]) / 2;
				this.spawnSparks(cx, cy, impactForce);
			}

			V1x=((this.Vx[j]*dx+this.Vy[j]*dy)*dx+(this.Vx[i]*dy-this.Vy[i]*dx)*dy)/dr;
			V1y=((this.Vx[j]*dx+this.Vy[j]*dy)*dy-(this.Vx[i]*dy-this.Vy[i]*dx)*dx)/dr;
			V2x=((this.Vx[i]*dx+this.Vy[i]*dy)*dx+(this.Vx[j]*dy-this.Vy[j]*dx)*dy)/dr;
			V2y=((this.Vx[i]*dx+this.Vy[i]*dy)*dy-(this.Vx[j]*dy-this.Vy[j]*dx)*dx)/dr;
			this.Vx[i]=V1x;
			this.Vy[i]=V1y;
			this.Vx[j]=V2x;
			this.Vy[j]=V2y;
			var dr_=Math.sqrt(dr);
			if(this.ball_mode[i]!=1)
			{
				this.x[i]+=(2*this.r-dr_)*(dx/dr_)*0.5;
				this.y[i]+=(2*this.r-dr_)*(dy/dr_)*0.5;
			}
			if(this.ball_mode[j]!=1)
			{
				this.x[j]-=(2*this.r-dr_)*(dx/dr_)*0.5;
				this.y[j]-=(2*this.r-dr_)*(dy/dr_)*0.5;
			}
		}
	},

	CheckDistance: function()
	{
		for(var i=0;i<this.num-1;i++)
			for(var j=i+1;j<this.num;j++)
				if((Math.sqrt((this.x[i]-this.x[j])*(this.x[i]-this.x[j])+(this.y[i]-this.y[j])*(this.y[i]-this.y[j]))<this.r*2 || (this.ball_mode[j]==2 && j==i+1)))
					this.CalVelocity(i,j);
	},

	check: function(i)
	{
		var IsTooClose=false;
		for(var j=0;j<i;j++)
			if(Math.sqrt((this.x[i]-this.x[j])*(this.x[i]-this.x[j])+(this.y[i]-this.y[j])*(this.y[i]-this.y[j]))<this.r*2)
				IsTooClose=true;
		return IsTooClose;
	},

	drawBall: function(x,y)
	{
		var color = this.rgb_mode ? "hsl(" + this.hue + ", 100%, 50%)" : "#0ff";
		ctx.beginPath();
		ctx.arc(x, y, this.r, 0, Math.PI * 2);
		ctx.lineWidth = 3;
		ctx.strokeStyle = color; 
		ctx.shadowColor = color;
		ctx.shadowBlur = this.glow;      
		ctx.fillStyle = "#050505";
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;      
	},

	drawBall1: function(x,y)
	{
		var color = this.rgb_mode ? "hsl(" + ((this.hue + 120) % 360) + ", 100%, 50%)" : "#f0f";
		ctx.beginPath();
		ctx.arc(x, y, this.r, 0, Math.PI * 2);
		ctx.lineWidth = 3;
		ctx.strokeStyle = color; 
		ctx.shadowColor = color;
		ctx.shadowBlur = this.glow;
		ctx.fillStyle = "#050505";
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;
	},
	
	drawLine: function(x1,y1,x2,y2)
	{
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.lineWidth = 2;
		ctx.stroke();
	},

	Slider1Changed: function(value) { this.r=value; },
	Slider2Changed: function(value) { this.vd=value; },
	Slider3Changed: function(value) { this.g=value; },
	Slider4Changed: function(value) { this.air_res=value; },
	SliderGlowChanged: function(value) { this.glow=value; },
	rgbModeChanged: function(value) { this.rgb_mode=value; },
	
	btnRestartClicked: function() { this.num=0; },
	btnAddClicked: function()
	{
		this.x[this.num]=Math.random()*canvas.width;
		this.y[this.num]=Math.random()*canvas.height;
		this.Vx[this.num]=-5+10*Math.random();
		this.Vy[this.num]=-5+10*Math.random();
		this.ball_mode[this.num]=this.adding_mode;
		this.num++;
	},
	btnRemoveClicked: function()
	{
		this.num--;
		if(this.num<0)this.num=0;
	},
	segmentedChanged: function(value) { this.adding_mode=value; },
	touchModeChanged: function(value) { this.touch_mode=value; },

	touchesBegan: function(n,x_,y_)
	{
		if (this.draw_vortex_mode) {
			this.addBlackHole(x_, y_);
			return;
		}

		if (this.draw_block_mode) {
			this.addBlock(x_, y_);
			return;
		}

		this.touch_x[n]=this.touch_x_1[n]=x_;
		this.touch_y[n]=this.touch_y_1[n]=y_;
		
		if (this.touch_mode!=1) {
			for (var i=0; i<this.num; i++)
				if(Math.sqrt((this.x[i]-this.touch_x[n])*(this.x[i]-this.touch_x[n])+(this.y[i]-this.touch_y[n])*(this.y[i]-this.touch_y[n]))<Math.max(this.r, 40))
					this.touched_ball[n]=i;
		}
		
		if (this.touched_ball[n]==-1 && this.touch_mode==1) {
			for (var i=0; i<this.num; i++)
				if(Math.sqrt((this.x[i]-this.touch_x[n])*(this.x[i]-this.touch_x[n])+(this.y[i]-this.touch_y[n])*(this.y[i]-this.touch_y[n]))<this.r)
					return;
			this.x[this.num]=this.touch_x[n];
			this.y[this.num]=this.touch_y[n];
			this.Vx[this.num]=0;
			this.Vy[this.num]=0;
			this.ball_mode[this.num]=this.adding_mode;
			this.num++;
		}
	},
	touchesMoved: function(n,x_,y_)
	{
		if (this.draw_vortex_mode) {
			return;
		}

		if (this.draw_block_mode) {
			this.addBlock(x_, y_);
			return;
		}

		this.touch_x[n]=x_;
		this.touch_y[n]=y_;
		
		if (this.touched_ball[n]==-1 && this.touch_mode==1) {
			for (var i=0; i<this.num; i++)
				if(Math.sqrt((this.x[i]-this.touch_x[n])*(this.x[i]-this.touch_x[n])+(this.y[i]-this.touch_y[n])*(this.y[i]-this.touch_y[n]))<this.r)
					return;
			this.x[this.num]=this.touch_x[n];
			this.y[this.num]=this.touch_y[n];
			this.Vx[this.num]=0;
			this.Vy[this.num]=0;
			this.ball_mode[this.num]=this.adding_mode;
			this.num++;
		}
	},
	touchesEnded: function(n,x_,y_)
	{
		this.touch_x[n]=x_;
		this.touch_y[n]=y_;
		this.touched_ball[n]=-1;
	}
};