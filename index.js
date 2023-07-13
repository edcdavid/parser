/* global $ */
/* global initialjson, feedback, classification, AnsiUp, dayjs */
const expectedClaimVersion = 'v0.0.1'
let buttonElementId = 'non'
let claimGlobal
let feedbackGlobal

function changeFunc () { // eslint-disable-line no-unused-vars
  if (buttonElementId === 'result-tab') {
    enableOptionButton()
  }
}

function enableOptionButton () {
  disableAllButton()
  enableSendDownload()
  buttonElementId = 'result-tab'
  const selectBox = document.getElementById('selectBox')
  const selectedValue = selectBox.options[selectBox.selectedIndex].value
  if (selectedValue === 'all') {
    showAll()
  } else {
    document.getElementById('results-table').setAttribute('hidden', 'hidden')
    document.getElementById('myCheck-result').removeAttribute('hidden')
    document.getElementById('optional-tab').removeAttribute('hidden')
    document.getElementById('myCheck-mandatory').removeAttribute('hidden')
    document.getElementById('mandatory-tab').removeAttribute('hidden')
  }
  showResults('optional')
  showResults('mandatory')
}

function showResults (optionalMandatory) {
  const checkBox = document.getElementById(optionalMandatory + '-tab')
  const selectBox = document.getElementById('selectBox')
  const selectedValue = selectBox.options[selectBox.selectedIndex].value
  if (selectedValue === 'faredge') {
    if (checkBox.checked === true) {
      document.getElementById(optionalMandatory + '-far-edge-table').removeAttribute('hidden')
    } else {
      document.getElementById(optionalMandatory + '-far-edge-table').setAttribute('hidden', 'hidden')
    }
  }
  if (selectedValue === 'telco') {
    if (checkBox.checked === true) {
      document.getElementById(optionalMandatory + '-telco-table').removeAttribute('hidden')
    } else {
      document.getElementById(optionalMandatory + '-telco-table').setAttribute('hidden', 'hidden')
    }
  }
  if (selectedValue === 'nontelco') {
    if (checkBox.checked === true) {
      document.getElementById(optionalMandatory + '-non-telco-table').removeAttribute('hidden')
    } else {
      document.getElementById(optionalMandatory + '-non-telco-table').setAttribute('hidden', 'hidden')
    }
  }
  if (selectedValue === 'extended') {
    if (checkBox.checked === true) {
      document.getElementById(optionalMandatory + '-extended-table').removeAttribute('hidden')
    } else {
      document.getElementById(optionalMandatory + '-extended-table').setAttribute('hidden', 'hidden')
    }
  }
}

function showTest (tableId, tableName, state, mandatoryOptional) { // eslint-disable-line no-unused-vars
  const checkBox = document.getElementById('filter-' + mandatoryOptional + '-' + state + '-' + tableName)
  const show = checkBox.checked
  if (show) {
    checkBox.setAttribute('checked', '')
  } else {
    checkBox.removeAttribute('checked')
  }
  const tableIdClean = tableId.replace(/#/g, '')
  const table = document.getElementById(tableIdClean)
  const elements = table.getElementsByClassName('accordion-item')
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const id = element.getAttribute('data-id')
    if (id === state) {
      if (show === true) {
        element.removeAttribute('hidden')
      } else {
        element.setAttribute('hidden', 'hidden')
      }
    }
  }
}

function showAll () {
  document.getElementById('mandatory-far-edge-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-non-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-extended-table').setAttribute('hidden', 'hidden')

  document.getElementById('optional-far-edge-table').setAttribute('hidden', 'hidden')
  document.getElementById('optional-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('optional-non-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('optional-extended-table').setAttribute('hidden', 'hidden')

  document.getElementById('results-table').removeAttribute('hidden')
}

function enableSendDownload () {
  document.getElementById('download').removeAttribute('hidden')
  document.getElementById('downloadjson').removeAttribute('hidden')
  document.getElementById('UploadFeedback').removeAttribute('hidden')
}

function disableAllButton () {
  buttonElementId = 'non'

  document.getElementById('mandatory-far-edge-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-non-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-extended-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-telco-table').setAttribute('hidden', 'hidden')

  document.getElementById('optional-far-edge-table').setAttribute('hidden', 'hidden')
  document.getElementById('optional-non-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('optional-extended-table').setAttribute('hidden', 'hidden')

  document.getElementById('optional-telco-table').setAttribute('hidden', 'hidden')

  document.getElementById('optional-tab').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-tab').setAttribute('hidden', 'hidden')

  document.getElementById('download').setAttribute('hidden', 'hidden')
  document.getElementById('downloadjson').setAttribute('hidden', 'hidden')
  document.getElementById('UploadFeedback').setAttribute('hidden', 'hidden')

  document.getElementById('myCheck-result').setAttribute('hidden', 'hidden')

  document.getElementById('myCheck-mandatory').setAttribute('hidden', 'hidden')
}

function fillVersions (input, element) {
  $(element).empty()
  $('<thead><tr><th scope="col">Component</th><th scope="col">Version</th></tr></thead><tbody>').appendTo($(element))
  for (const key in input) {
    $('<tr><td><b>' + key + '</b></td><td>' + input[key] + '</td></tr>').appendTo($(element))
  }
  $('</tbody>').appendTo($(element))
}

function getClaimVersion (input) {
  const claimVersion = input.claimFormat
  if (typeof claimVersion === 'undefined') {
    return 'nil - claimFormat version not present in claim file'
  }
  const regex = /(v[0-9]\.[0-9]\.[0-9])/
  const matches = claimVersion.match(regex)
  if (matches !== null && matches.length > 1) {
    return matches[1]
  }
  return 'nil - claimFormat version is not in a valid format, check claim file'
}

function fillMetadata (input, element) {
  $(element).empty()
  $('<tbody>').appendTo($(element))
  for (const key in input) {
    $('<tr><td><b>' + key + '</b></td><td>' + input[key] + '</td></tr>').appendTo($(element))
  }
  $('</tbody>').appendTo($(element))
}

const tableNameMap = {
  faredge: 'Far-Edge',
  telco: 'Telco',
  nontelco: 'Non-Telco',
  extended: 'Extended',
  all: 'All'
}

function fillResults (claimJson, classificationJson, mandatoryTableElement, optionalTableElement, tableName) {
  $(mandatoryTableElement).empty()
  $(optionalTableElement).empty()
  let mandatoryTestText = ''
  let optionalTestText = ''
  // The results object is composed of multiple objects, 1 per test
  // Inside the object we have an array of results
  let id = 1
  // eslint-disable-next-line no-undef
  const ansiUp = new AnsiUp()

  let testsTotal = 0
  let testsPassed = 0
  let testsSkipped = 0
  let testsFailed = 0
  let testsAborted = 0
  let testsTotalOptional = 0
  let testsPassedOptional = 0
  let testsSkippedOptional = 0
  let testsFailedOptional = 0
  let testsAbortedOptional = 0
  // Compute number of passed/skipped/failed results
  for (const testIdFromClaim in claimJson) {
    for (const item of claimJson[testIdFromClaim]) {
      for (const testIdFromClassification in classificationJson) {
        let eqData = classificationJson[testIdFromClassification].FarEdge

        if (tableName === 'telco') {
          eqData = classificationJson[testIdFromClassification].Telco
        }
        if (tableName === 'nontelco') {
          eqData = classificationJson[testIdFromClassification].NonTelco
        }
        if (tableName === 'extended') {
          eqData = classificationJson[testIdFromClassification].Extended
        }

        if (testIdFromClaim === testIdFromClassification) {
          if (item.state === 'passed') {
            if (eqData === 'Mandatory' || tableName === 'all') {
              testsTotal++
              testsPassed++
            } else {
              testsTotalOptional++
              testsPassedOptional++
            }
          } else if (item.state === 'skipped') {
            if (eqData === 'Mandatory' || tableName === 'all') {
              testsTotal++
              testsSkipped++
            } else {
              testsTotalOptional++
              testsSkippedOptional++
            }
          } else if (item.state === 'failed') {
            if (eqData === 'Mandatory' || tableName === 'all') {
              testsTotal++
              testsFailed++
            } else {
              testsTotalOptional++
              testsFailedOptional++
            }
          } else if (item.state === 'aborted') {
            if (eqData === 'Mandatory' || tableName === 'all') {
              testsTotal++
              testsAborted++
            } else {
              testsTotalOptional++
              testsAbortedOptional++
            }
          }
        }
      }
    }
  }

  if (tableName === 'all') {
    mandatoryTestText = '<thead><tr><th style="width:15%" scope="col">Test summary (' + tableNameMap[tableName] + ')</th><th scope="col">Test feedback</th></tr></thead><tbody>'
  } else {
    mandatoryTestText = '<thead><tr><th style="width:15%" scope="col">Mandatory Test  summary (' + tableNameMap[tableName] + ')</th><th scope="col">Test feedback</th></tr></thead><tbody>'
  }

  optionalTestText = '<thead><tr><th style="width:15%" scope="col">Optional Test summary (' + tableNameMap[tableName] + ')</th><th scope="col">Test results</th></tr></thead><tbody>'
  optionalTestText += '<tr><td class="align-top"><b>Total:</b> ' + testsTotalOptional + ' '
  optionalTestText += '<br><b><tg>Passed:</tg></b> ' + testsPassedOptional + ' '
  optionalTestText += '<input type="checkbox" id="filter-optional-passed-' + tableName + '" checked onclick="showTest(\'' + optionalTableElement + '\',\'' + tableName + '\', \'passed\', \'optional\' )" >'
  optionalTestText += '<br><b><tgy>Skipped:</tgy></b> ' + testsSkippedOptional + ' '
  optionalTestText += '<input type="checkbox" id="filter-optional-skipped-' + tableName + '" checked onclick="showTest(\'' + optionalTableElement + '\',\'' + tableName + '\', \'skipped\', \'optional\' )" >'
  optionalTestText += '<br><b><ty>Failed:</ty></b> ' + testsFailedOptional + ' '
  optionalTestText += '<input type="checkbox" id="filter-optional-failed-' + tableName + '" checked onclick="showTest(\'' + optionalTableElement + '\',\'' + tableName + '\', \'failed\', \'optional\' )" >'
  optionalTestText += '<br><b><tpurple>Aborted:</tpurple></b> ' + testsAbortedOptional + ' '
  optionalTestText += '<input type="checkbox" id="filter-optional-aborted-' + tableName + '" checked onclick="showTest(\'' + optionalTableElement + '\',\'' + tableName + '\', \'aborted\', \'optional\' )" >'
  optionalTestText += '</td><td>'
  optionalTestText += '<div class="accordion" id="results-accordion">'
  // First we will have a left column in the table with the summarized results
  mandatoryTestText += '<tr><td class="align-top"><b>Total:</b> ' + testsTotal + '<br><b><tg>Passed:</tg></b> ' + testsPassed + ' '
  mandatoryTestText += '<input type="checkbox" id="filter-mandatory-passed-' + tableName + '" checked onclick="showTest(\'' + mandatoryTableElement + '\',\'' + tableName + '\', \'passed\',\'mandatory\' )" >'
  mandatoryTestText += '<br><b><tgy>Skipped:</tgy></b> ' + testsSkipped + ' '
  mandatoryTestText += '<input type="checkbox" id="filter-mandatory-skipped-' + tableName + '" checked onclick="showTest(\'' + mandatoryTableElement + '\',\'' + tableName + '\', \'skipped\', \'mandatory\' )" >'
  mandatoryTestText += '<br><b><tred>Failed:</tred></b> ' + testsFailed + ' '
  mandatoryTestText += '<input type="checkbox" id="filter-mandatory-failed-' + tableName + '" checked onclick="showTest(\'' + mandatoryTableElement + '\',\'' + tableName + '\', \'failed\', \'mandatory\' )" >'
  mandatoryTestText += '<br><b><tpurple>Aborted:</tpurple></b> ' + testsAborted + ' '
  mandatoryTestText += '<input type="checkbox" id="filter-mandatory-aborted-' + tableName + '" checked onclick="showTest(\'' + mandatoryTableElement + '\',\'' + tableName + '\', \'aborted\', \'mandatory\' )" >'
  mandatoryTestText += '</td><td>'

  mandatoryTestText += '<div class="accordion" id="results-accordion">'
  // sorting according to state
  const sortedClaimJson = Object.entries(claimJson).sort(function (a, b) {
    const stringA = a[1][0].testID.id + a[1][0].state
    const stringB = b[1][0].testID.id + b[1][0].state
    return stringA.localeCompare(stringB)
  })
  const sortedClaimJsonObj = Object.fromEntries(sortedClaimJson)

  for (const testIdFromSortedClaim in sortedClaimJsonObj) {
    for (const testIdFromClassification in classificationJson) {
      let eqData = classificationJson[testIdFromClassification].FarEdge

      if (tableName === 'telco') {
        eqData = classificationJson[testIdFromClassification].Telco
      }
      if (tableName === 'nontelco') {
        eqData = classificationJson[testIdFromClassification].NonTelco
      }
      if (tableName === 'extended') {
        eqData = classificationJson[testIdFromClassification].Extended
      }

      if (testIdFromSortedClaim === testIdFromClassification) {
        const currentTestResult = claimJson[testIdFromSortedClaim][0]
        let commonTestTextContent = ''
        // NOTE: we are assuming the test result is determined by the passed/failed state of the first item
        const testStatus = currentTestResult.state
        let buttontype = ''
        if (testStatus === 'passed') {
          buttontype = 'bg-success text-white'
        } else if (testStatus === 'skipped') {
          buttontype = 'bg-dark-subtle text-black'
        } else if (testStatus === 'aborted') {
          buttontype = 'btn-purple'
        } else {
          buttontype = 'bg-warning text-white'
          if (eqData !== 'Optional' || tableName === 'all') {
            buttontype = 'bg-danger text-white'
          }
        }
        const itemid = 'collapse' + id
        const headingid = 'heading' + id
        commonTestTextContent += '<div data-id="' + testStatus + '" class="accordion-item"><h2 class="accordion-header" id="' + headingid + '"><button class="accordion-button collapsed ' + buttontype + '" type="button" data-bs-toggle="collapse" data-bs-target="#' + itemid + '" aria-expanded="true" aria-controls="' + itemid + '">'
        commonTestTextContent += testIdFromSortedClaim + '</button></h2>'
        // Now we should populate the item contents
        commonTestTextContent += '<div id="' + itemid + '" class="accordion-collapse collapse" aria-labelledby="' + headingid + '">'
        commonTestTextContent += '<div class="accordion-body" >'
        // Inside the accordion, 1 table with the following colummns
        commonTestTextContent += '<h1>Results</h1>'
        commonTestTextContent += '<div class="table-responsive">'
        commonTestTextContent += '<table id="myTable-' + testIdFromSortedClaim + '" class="table table-bordered"><thead><tr>'
        commonTestTextContent += '<th>Test ID</th>'
        commonTestTextContent += '<th class="th-lg">Test Text</th>'
        commonTestTextContent += '<th>Duration</th>'
        commonTestTextContent += '<th>State</th>'
        commonTestTextContent += '<th>Test output</th>'
        commonTestTextContent += '</tr></thead><tbody>'

        // Note we are skipping some columns for now
        // And 1 row per test
        // eslint-disable-next-line no-undef
        dayjs.extend(window.dayjs_plugin_duration)
        const duration = dayjs.duration(currentTestResult.duration / 1000000)
        const formattedDuration = duration.format('D[d] H[h] m[m] s[s] SSS[ms]')
        let skippedReason = ''
        if (currentTestResult.state === 'skipped') {
          skippedReason = currentTestResult.failureReason
          if (skippedReason === '') {
            skippedReason = 'Test case skipped by configuration'
          }
          skippedReason = ' ( ' + skippedReason + ' )'
        }
        console.log(currentTestResult)
        commonTestTextContent += '<tr><td  style="white-space: nowrap;">' + currentTestResult.testID.id + '</td>'
        commonTestTextContent += '<td class="th-lg">' + currentTestResult.testText.replace(/\n/g, '<br>') + '</td>'
        commonTestTextContent += '<td>' + formattedDuration + '</td>'
        commonTestTextContent += '<td><b>' + currentTestResult.state + '</b>' + skippedReason + '</td>'
        commonTestTextContent += '<td>' + ansiUp.ansi_to_html(ExtractLog(currentTestResult.CapturedTestOutput)).replace(/\n/g, '<br>') + '</td></tr>'
        const jsonObjNonCompliant = NonCompliantReasonTextToJson(currentTestResult.CapturedTestOutput)
        const jsonObjCompliant = CompliantReasonTextToJson(currentTestResult.CapturedTestOutput)

        id = id + 1
        if (eqData === 'Optional' && tableName !== 'all') {
          optionalTestText += commonTestTextContent
          optionalTestText += '</tbody></table></div>'

          optionalTestText += '<h1>Feedback</h1><label>Write your feedback for ' + currentTestResult.testID.id + ' test case</label>'
          optionalTestText += '<textarea style="width: 100%; margin: 0 auto;" rows = "5" id="source-' + tableName + '-' + currentTestResult.testID.id + '" type="text" ></textarea>'

          optionalTestText += '<h1>Non-Compliant objects</h1>'
          optionalTestText += createReasonTableAllTypes(jsonObjNonCompliant)
          optionalTestText += '<h1>Compliant objects</h1>'
          optionalTestText += createReasonTableAllTypes(jsonObjCompliant)
          optionalTestText += '</div></div></div>'
        } else {
          mandatoryTestText += commonTestTextContent
          mandatoryTestText += '</tbody></table></div>'

          mandatoryTestText += '<h1>Feedback</h1><label>Write your feedback for ' + currentTestResult.testID.id + ' test case</label>'
          mandatoryTestText += '<textarea style="width: 100%; margin: 0 auto;" rows = "5" id="source-' + tableName + '-' + currentTestResult.testID.id + '" type="text"></textarea>'

          mandatoryTestText += '<h1>Non-Compliant objects</h1>'
          mandatoryTestText += createReasonTableAllTypes(jsonObjNonCompliant)
          mandatoryTestText += '<h1>Compliant objects</h1>'
          mandatoryTestText += createReasonTableAllTypes(jsonObjCompliant)
          mandatoryTestText += '</div></div></div>'
        }
      }
    }
  }

  optionalTestText += '</div></td></tr></tbody>'
  mandatoryTestText += '</div></td></tr></tbody>'

  $(mandatoryTestText).appendTo($(mandatoryTableElement))
  $(optionalTestText).appendTo($(optionalTableElement))
}

function fillFeedback (input) {
  for (const key in input) {
    // copy previous data
    const element = document.getElementById(key)
    if (element === null) {
      continue
    }
    element.textContent = element.value
    element.textContent = input[key]
    element.value = input[key]
  }
}

function copyData (key) {
  const selectBox = document.getElementById('selectBox')
  const tableName = selectBox.options[selectBox.selectedIndex].value
  const sourceId = 'source-' + tableName + '-' + key
  const data = document.getElementById(sourceId).value
  document.getElementById(sourceId).textContent = data
}

let uuidNode = 1 // zero is root
$(document).ready(function () {
  // Load initial json, if available
  if (typeof initialjson !== 'undefined') {
    claimGlobal = initialjson
  }
  if (typeof feedback !== 'undefined') {
    feedbackGlobal = feedback
  }
  // Get the URL
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  // Get the claim file URL
  const claimFileParam = urlParams.get('claimfile')
  const feedbackFileParam = urlParams.get('feedback')

  console.log('claimfile via url:', claimFileParam)
  console.log('feedbackfile via url:', feedbackFileParam)

  fetchRenderClaimFile(claimFileParam)
  fetchRenderFeedbackFile(feedbackFileParam)

  // First render if local files or url provided files are present
  if (typeof claimGlobal !== 'undefined') {
    renderResultsWithModal()
  }
  const inputElement1 = document.getElementById('feedbackFile')
  inputElement1.addEventListener('change', handleFeedbackFiles, false)
  function handleFeedbackFiles () {
    const fileList = this.files /* now you can work with the file list */
    if (fileList.length) {
      // We have a file to load
      const fileUploaded = new FileReader()
      fileUploaded.addEventListener('load', e => {
        fillFeedback(JSON.parse(fileUploaded.result))
      })
      fileUploaded.readAsText(fileList[0])
    }
    this.value = null
  }

  const inputElement = document.getElementById('formFile')
  inputElement.addEventListener('change', handleFiles, false)
})

function handleFiles () {
  const fileList = this.files /* now you can work with the file list */
  if (fileList.length) {
    // We have a file to load
    const fileUploaded = new FileReader()
    fileUploaded.addEventListener('load', e => {
      claimGlobal = JSON.parse(fileUploaded.result)
      renderResultsWithModal()
    })
    fileUploaded.readAsText(fileList[0])
  }
}

function renderResultsWithModal () {
  const claimVersion = getClaimVersion(claimGlobal.claim.versions)
  const modalBody = document.getElementById('modalBody')
  if (expectedClaimVersion !== claimVersion) {
    $('#staticBackdrop').modal('show')
    modalBody.textContent = 'Unsupported claim format. Expecting: ' + expectedClaimVersion + ' but got: ' + claimVersion
    // Get a reference to the button element
    const myButton = document.getElementById('continueLoadingClaim')

    // Add an event listener to the button
    myButton.addEventListener('click', renderResults)
  } else {
    renderResults()
  }
}

function fetchRenderClaimFile (fileParam) {
  if (fileParam === null) {
    return
  }
  fetch(fileParam)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      claimGlobal = data
      renderResultsWithModal()
    })
    .catch((error) => {
      console.log(`Error: ${error.message}`)
    })
}

function fetchRenderFeedbackFile (fileParam) {
  if (fileParam === null) {
    return
  }
  fetch(fileParam)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      feedbackGlobal = data
      renderResultsWithModal()
    })
    .catch((error) => {
      console.log(`Error: ${error.message}`)
    })
}

function renderResults () {
  if (typeof claimGlobal !== 'undefined') {
    // Create treeview from JSON data
    let result = formatForFastTreeview(0, claimGlobal.claim.configurations, [])
    addOrphans(result.objectArray, '#config-table')
    result = formatForFastTreeview(0, claimGlobal.claim.nodes, [])
    addOrphans(result.objectArray, '#nodes-table')
    fillMetadata(claimGlobal.claim.metadata, '#metadata-table')
    fillVersions(claimGlobal.claim.versions, '#versions-table')
    fillResults(claimGlobal.claim.results, classification, '#results-table', '#optional-', 'all')
    fillResults(claimGlobal.claim.results, classification, '#mandatory-far-edge-table', '#optional-far-edge-table', 'faredge')
    fillResults(claimGlobal.claim.results, classification, '#mandatory-telco-table', '#optional-telco-table', 'telco')
    fillResults(claimGlobal.claim.results, classification, '#mandatory-non-telco-table', '#optional-non-telco-table', 'nontelco')
    fillResults(claimGlobal.claim.results, classification, '#mandatory-extended-table', '#optional-extended-table', 'extended')
    if (typeof feedbackGlobal !== 'undefined') {
      fillFeedback(feedbackGlobal)
    }
  }
}

function linkToStyle (link) {
  const css = []
  const sheet = link.sheet
  let rules
  try {
    rules = sheet.cssRules || sheet.rules
  } catch (error) {
    console.log(error)
    return null
  }

  for (let i = 0; i < rules.length; ++i) {
    const rule = rules[i]
    if (rules[i].selectorText === '.collapse:not(.show)') {
      continue
    }
    css.push(rule.cssText)
  }
  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(
    document.createTextNode(css.join('\r\n'))
  )
  return style
}

function getHtmlResults () {
  let selectBox = document.getElementById('selectBox')

  const doc = document.implementation.createHTMLDocument()
  const head = doc.head
  const body = doc.body
  selectBox = document.getElementById('selectBox')
  insertResults(body, 'mandatory')
  if (selectBox !== 'all') {
    insertResults(body, 'optional')
  }

  document.querySelectorAll("link[rel='stylesheet']").forEach(function (link) {
    const style = linkToStyle(link)
    if (style !== null) {
      head.insertBefore(style, head.firstChild)
    }
  })
  document.querySelectorAll('style').forEach(function (style) {
    const clonedStyle = style.cloneNode(true)
    head.insertBefore(clonedStyle, head.firstChild)
  })

  // Make document read-only
  const checkboxes = doc.querySelectorAll('input[type="checkbox"]')
  const textareas = doc.querySelectorAll('textarea')

  checkboxes.forEach(checkbox => {
    checkbox.setAttribute('disabled', 'disabled')
  })

  textareas.forEach(textarea => {
    textarea.readOnly = true
  })

  return doc.documentElement.outerHTML
}

function downloadjson () { // eslint-disable-line no-unused-vars
  const dict = {}
  const tablesName = ['all', 'telco', 'nontelco', 'extended', 'faredge'] // to go over all the feedback and save it
  for (const key in claimGlobal.claim.results) {
    for (const key2 in this.classification) {
      if (key === key2) {
        for (let i = 0; i < tablesName.length; i++) {
          const keydict = 'source-' + tablesName[i] + '-' + key
          const data = document.getElementById(keydict)
          if (data !== null) {
            dict[keydict] = data.value
          }
        }
      }
    }
  }

  const pom = document.createElement('a')
  pom.setAttribute('href', 'data:text/json;charset=utf-8,' +

    encodeURIComponent(JSON.stringify(dict)))
  pom.setAttribute('download', 'feedback.json')
  pom.style.display = 'none'
  document.body.appendChild(pom)
  pom.click()
  document.body.removeChild(pom)
}

function download () { // eslint-disable-line no-unused-vars
  for (const key in claimGlobal.claim.results) {
    for (const key2 in this.classification) {
      if (key === key2) {
        copyData(key2)
      }
    }
  }

  const pom = document.createElement('a')
  pom.setAttribute('href', 'data:text/html;charset=UTF-8,' + encodeURIComponent(getHtmlResults()))
  pom.setAttribute('download', 'results-feedback')

  pom.style.display = 'none'
  document.body.appendChild(pom)

  pom.click()

  document.body.removeChild(pom)
}

function insertResults (body, optionalMandatory) {
  const checkBox = document.getElementById(optionalMandatory + '-tab')
  const selectBox = document.getElementById('selectBox')
  const selectedValue = selectBox.options[selectBox.selectedIndex].value
  let table = document.getElementById('results-table')
  if (selectedValue === 'faredge') {
    if (checkBox.checked === true) {
      table = document.getElementById(optionalMandatory + '-far-edge-table')
    }
  }
  if (selectedValue === 'telco') {
    if (checkBox.checked === true) {
      table = document.getElementById(optionalMandatory + '-telco-table')
    }
  }
  if (selectedValue === 'nontelco') {
    if (checkBox.checked === true) {
      table = document.getElementById(optionalMandatory + '-non-telco-table')
    }
  }
  if (selectedValue === 'extended') {
    if (checkBox.checked === true) {
      table = document.getElementById(optionalMandatory + '-extended-table')
    }
  }
  const clonedTable = table.cloneNode(true)
  body.appendChild(clonedTable)
}

// extract non-compliant json text from test output with regex
function NonCompliantReasonTextToJson (reasonText) {
  const regex = /NonCompliantObjectsOut":(\[.*])/
  const match = regex.exec(reasonText)
  let jsonObj
  if (match) {
    const jsonStr = match[1]
    jsonObj = JSON.parse(jsonStr)
  }
  return jsonObj
}

// extract compliant json text from test output with regex
function CompliantReasonTextToJson (reasonText) {
  const regex = /"CompliantObjectsOut":(\[.*]),"NonCompliantObjectsOut"/
  const match = regex.exec(reasonText)
  let jsonObj
  if (match) {
    const jsonStr = match[1]
    jsonObj = JSON.parse(jsonStr)
  }
  return jsonObj
}

// extract compliant json text from test output with regex
function ExtractLog (fullLog) {
  const regex = /(.*){"CompliantObjectsOut"/
  const match = regex.exec(fullLog)
  let logWithNoReason = fullLog
  if (match) {
    logWithNoReason = match[1]
  }
  return logWithNoReason
}

// create a list of object types present in json output
function createTypeList (jsonData) {
  const objectTypes = new Map()
  if (typeof jsonData === 'undefined') {
    return objectTypes
  }
  jsonData.forEach(function (item) {
    objectTypes.set(item.ObjectType, true)
  })
  return objectTypes
}

// parse json text and creates one HTML table per type
function createReasonTableAllTypes (jsonData) {
  const aTypeMap = createTypeList(jsonData)
  let allTables = ''
  aTypeMap.forEach(function (value, key) {
    allTables += '<h2> Type: ' + key + '</h2>'
    allTables += '<div class="table-responsive">'
    allTables += createReasonTableOneType(jsonData, key)
    allTables += '</div>'
  })
  return allTables
}

// parse json text and creates one HTML table for given type
function createReasonTableOneType (jsonData, aType) {
  if (typeof jsonData === 'undefined') {
    return ''
  }
  // Create table element
  const table = document.createElement('table')
  table.setAttribute('border', '1')
  table.setAttribute('class', 'table table-striped')
  let firstItem = true
  // Create table body
  const tbody = document.createElement('tbody')
  jsonData.forEach(function (item) {
    // if not right type exit
    if (item.ObjectType !== aType) {
      return
    }
    if (firstItem) {
      // Create table header
      const thead = document.createElement('thead')
      const headerRow = document.createElement('tr')
      if (item.ObjectFieldsKeys !== null) {
        Object.values(item.ObjectFieldsKeys).forEach(function (key) {
          const th = document.createElement('th')
          th.textContent = key
          headerRow.appendChild(th)
        })
      }
      thead.appendChild(headerRow)
      table.appendChild(thead)
      firstItem = false
    }
    const row = document.createElement('tr')
    if (item.ObjectFieldsValues !== null) {
      Object.values(item.ObjectFieldsValues).forEach(function (value) {
        const cell = document.createElement('td')
        cell.textContent = value
        row.appendChild(cell)
      })
    }
    tbody.appendChild(row)
  })
  table.appendChild(tbody)
  return table.outerHTML
}

function isStringInt (str) {
  return /^\d+$/.test(str)
}

// Fast tree
function formatForFastTreeview (parentKey, data, arr) {
  let objectName = ''
  let objectNamespace = ''
  for (const key in data) {
    if (data[key] === null || key === 'managedFields') {
      continue
    }
    if (key.toLowerCase() === 'name') {
      objectName = data[key]
    }
    if (key.toLowerCase() === 'namespace') {
      objectNamespace = data[key]
    }
    const objectID = uuidNode++
    if (Array.isArray(data[key]) || data[key].toString() === '[object Object]') {
      // when data[key] is an array or object

      const result = formatForFastTreeview(objectID, data[key], arr)
      const childName = result.name
      const childNamespace = result.namespace
      if (childName !== '') {
        objectName = childName
        objectNamespace = childNamespace
      }
      let nameToPush = key
      if (isStringInt(key) && objectName !== '') {
        nameToPush = 'ns:' + objectNamespace + ' name:' + objectName
        objectName = ''
        objectNamespace = ''
      }

      arr.push({
        id: objectID.toString(),
        name: nameToPush,
        parent: parentKey.toString()
      })
    } else {
      // when data[key] is just strings or integer values
      arr.push({
        id: objectID.toString(),
        name: key + ' : ' + data[key],
        parent: parentKey.toString()
      })
    }
  }
  return { objectArray: arr, name: objectName, namespace: objectNamespace }
}

function orphans (data) {
  return data.filter(function (item) {
    return item.parent === '0'
  })
}

function hasChildren (data, parentId) {
  return data.some(function (item) {
    return item.parent === parentId
  })
}

function getChildren (data, parentId) {
  return data.filter(function (item) {
    return item.parent === parentId
  })
}

function generateListItem (data, item) {
  const li = document.createElement('li')
  li.id = 'item-' + item.id
  if (hasChildren(data, item.id)) {
    const a = document.createElement('a')
    a.href = '#'
    a.textContent = '+'
    a.classList.add('plus')
    a.title = 'hold shift to expand sub tree'
    a.addEventListener('click', expand.bind(null, data), { once: true })
    li.appendChild(a)
  }
  const span = document.createElement('span')
  span.textContent = item.name
  li.appendChild(span)
  return li
}

function expand (data, event) {
  event.preventDefault()
  event.stopPropagation()
  const et = event.target
  const parent = et.parentElement
  const id = parent.id.replace('item-', '')
  const kids = getChildren(data, id)
  const items = kids.map(generateListItem.bind(null, data))
  const ul = document.createElement('ul')
  items.forEach(function (li) {
    ul.appendChild(li)
  })
  parent.appendChild(ul)
  et.classList.remove('plus')
  et.classList.add('minus')
  et.textContent = '-'
  et.addEventListener('click', collapse.bind(null, data), { once: true })

  if (event.shiftKey) {
    const max = countChildren(data, id, 0)
    console.log(max)
    initProgressBar()
    expandAll({ value: ul }, max, { value: 2 })
  }
}

function collapse (data, event) {
  event.preventDefault()
  event.stopPropagation()
  const et = event.target
  const parent = et.parentElement
  const ul = parent.querySelector('ul')
  parent.removeChild(ul)
  et.classList.remove('minus')
  et.classList.add('plus')
  et.textContent = '+'
  et.addEventListener('click', expand.bind(null, data), { once: true })
}

function addOrphans (data, rootObject) {
  const root = document.querySelector(rootObject)
  const orphansArray = orphans(data)
  if (orphansArray.length) {
    const items = orphansArray.map(generateListItem.bind(null, data))
    const ul = document.createElement('ul')
    items.forEach(function (li) {
      ul.appendChild(li)
    })
    root.appendChild(ul)
  }
}

function expandAll (obj, max, count) {
  if (isAnchorElement(obj.value)) {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    obj.value.dispatchEvent(clickEvent)
  }
  count.value++
  const percent = count.value * 100 / max
  updateProgressBar(percent)
  // Check if the object has children
  if (obj.value.children.length > 0) {
    // Iterate through the children and recursively process each child
    setTimeout(function () {
      for (let i = 0; i < obj.value.children.length; i++) {
        const child = obj.value.children[i]
        expandAll({ value: child }, max, count)
      }
    }, 0)
  }
}

function isAnchorElement (obj) {
  return obj instanceof HTMLAnchorElement
}

function countChildren (data, id, count) {
  const kids = getChildren(data, id)
  count++
  if (kids.length > 0) {
    count += 2
  }
  kids.forEach(function (kid) {
    count = countChildren(data, kid.id, count) + 1
  })
  return count
}

function updateProgressBar (value) {
  const progressBar = document.querySelector('.progress-bar')
  const strippedStr = progressBar.style.width.replace(/%/g, '')
  const currentValue = parseInt(strippedStr)
  if (value >= currentValue + 2) {
    progressBar.style.width = value.toString() + '%'
  }
}

function initProgressBar () {
  const progressBar = document.querySelector('.progress-bar')
  progressBar.style.width = '0%'
}
