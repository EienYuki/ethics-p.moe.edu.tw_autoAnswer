/************************
 * 自動作答 https://ethics-p.moe.edu.tw/exam/
 * 作者：EienYuki   https://github.com/EienYuki
 * 
 * 如何使用？
 * 有答案的 YEE.run_Auto(JSON)
 * 沒有的 YEE.run_Auto()
 ***********************/

window.YEE = {
	ans: [],
	data: [],
	getRandom (min,max) {
		return Math.floor(Math.random()*(max-min+1))+min
	},
	copy (s) {
		$('body').append('<textarea id="clip_area"></textarea>')
		  
		var clip_area = $('#clip_area')
		  
		clip_area.text(s)
		clip_area.select()
	  
		document.execCommand('copy')
	  
		clip_area.remove()
	},
	getJsno_Str_data () {
		this.copy(JSON.stringify(this.data))
		return JSON.stringify(this.data)
	},
	getJsno_Str_ans () {
		this.copy(JSON.stringify(this.ans))
		return JSON.stringify(this.ans)
	},

	// 讀取剛剛的作答紀錄 在執行 analysis_Bpart 前一定要執行！！
	readData (jsno_str) {
		this.data = JSON.parse(jsno_str)
		console.log('OK readData')
	},
	// 讀取答案紀錄 在執行 analysis_Apart analysis_Bpart 前一定要執行！！  除非真的沒有答案。。。
	readAns (jsno_str) {
		this.ans = JSON.parse(jsno_str)
		console.log('OK readAns')
	},
	readAns_append (jsno_str) {
		this.ans = [this.ans, ...JSON.parse(jsno_str)]
		console.log('OK readAns_append')
	},
	// 作答 如果有答案會自動選正確的 沒有的話隨機
	answer (tg) {
		let all = (tg)? tg.find(".table.question > tbody > tr") : $(".table.question > tbody > tr")
		let count_O = 0, count_X = 0
		for (let i=0;i<all.length;i++) {
			let tmp = $(all[i])
			let title = tmp.find('p').text()
	
			let flag = true
			for (const x of this.ans) {
				if (x.title == title) {
					flag = false
					$(tmp.find('input')[Number(x.select)]).click()
					count_O += 1
				}
			}
			
			if (flag) {
				$(tmp.find('input')[this.getRandom(1,4)]).click()
				count_X += 1
			}
		}
		console.log('OK answer', `正確：${count_O}, 用猜的：${count_X}`)
	},
	// 作答完畢再送出前 執行 執行完後 會自動複製 作答紀錄 到剪貼簿，請務必保存 這資料 analysis_Bpart 會用到
	analysis_Apart (tg) {
		let all = (tg)? tg.find(".table.question > tbody > tr") : $(".table.question > tbody > tr")
		let out = []
		for (let i=0;i<all.length;i++) {
			let tmp = $(all[i])
			let title = tmp.find('p').text()
			let select = tmp.find('input[type="hidden"]').val()
			out.push({title, select})
		}
		this.data = out
		this.getJsno_Str_data()
		console.log('OK analysis_Apart')
	},
	// 作答完畢再送出後 執行 他會比較你哪些題目是對的 在執行前請一定要執行 readData readAns，如果是第一次 那只需 readData
	// 執行完畢後會自動把正確答案放在 剪貼簿裡 請務必保存！！
	analysis_Bpart (tg) {
		let all = (tg)? tg.find(".table.question > tbody > tr") : $(".table.question > tbody > tr")
		let 違い = []
		for (let i=0;i<all.length;i++) {
			let tmp = $(all[i])
			let title = $(tmp.find('p')[0]).text()
			違い.push(title)
		}
		this.data.filter( (item, index, array) => {
			let flag = true
			for (const x of 違い) {
				if(x == item.title) {
					flag = false
					break
				}
			}
			let test = this.ans.filter((item2, index2, array2) => {
				return item2.title == item.title
			})
			if (flag && test.length == 0) this.ans.push(item)
			return flag
		})
		this.getJsno_Str_ans()
		console.log('OK analysis_Bpart')
	},

	run_Apart (ans_json_str) {
		if (ans_json_str) this.readAns(ans_json_str)
		this.answer()
		this.analysis_Apart()
		return this.getJsno_Str_data()
	},
	run_Bpart (data_json_str, ans_json_str) {
		if (ans_json_str) this.readAns(ans_json_str)
		if (data_json_str) this.readData(data_json_str)
		this.analysis_Bpart()
		return this.getJsno_Str_ans()
	},

	btn_auto_answer_ans_onclick () {
		this.readAns($("#auto_answer_ans").val())
		this.run_Auto()
	},
	initUI () {
		this.iframe = document.createElement('iframe')
		this.name = `run${new Date().getTime()}`
		this.iframe.id = this.name
		this.iframe.name = this.name
		this.iframe.style.width = "100vw"
		this.iframe.style.height = "70vh"
		this.iframe.src = 'https://ethics-p.moe.edu.tw/exam/'

		$("body").html(`
			<div class="container" style="height: 30vh;">
				<div class="row">
					<div class="form-group" style="margin-top: 10px;">
						<label for="auto_answer_ans">答案輸入區塊</label>
						<textarea class="form-control" id="auto_answer_ans" rows="5"></textarea>
					</div>
					<div class="form-group">
						<button type="button" class="btn btn-primary" onclick="YEE.btn_auto_answer_ans_onclick()">開始</button>
						<label style="margin-left: 10px;"> ps:作答完成後會自動加上新的答案 所以要保留紀錄請務必儲存</label>
					</div>
				</div>
			</div>
		`)
		$("body").append(this.iframe)
	},
	run_Auto (ans_json) {
		this.iframe.src = 'https://ethics-p.moe.edu.tw/exam/'

		let my = this
		let box = {}
		
		console.log("開始 (延遲5秒)")
		if (ans_json) my.ans = ans_json

		setTimeout( () => {
			let f = document.getElementById(my.name)
			let doc = f.contentDocument
			box = $(doc)

			box.find('#btnStart').click()
			console.log("準備開始作答 (延遲5秒)")
		}, 5000)

		setTimeout( () => {
			let f = document.getElementById(my.name)
			let doc = f.contentDocument
			box = $(doc)
			
			my.answer(box)
			my.analysis_Apart(box)
			
			box.find("#btnSubmit").click()
			console.log("作答完成 (延遲5秒)")
		}, 10000)

		setTimeout( () => {
			let f = document.getElementById(my.name)
			let doc = f.contentDocument
			box = $(doc)

			my.analysis_Bpart(box)

			if ( confirm ("要在做一次?") )
			{
				$("#auto_answer_ans").val(my.getJsno_Str_ans())
				my.run_Auto()
			}
			else　{
				let jsno_str = my.getJsno_Str_ans()
				$("#auto_answer_ans").val(jsno_str)
				console.log("以下是答案")
				console.log(jsno_str)
				console.log("全部完成 答案請保存 (這是 JSON)")
			}
			
		}, 15000)
	}
}

window.YEE.initUI()