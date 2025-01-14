/* global $ */
/* global initialjson, feedback, AnsiUp, dayjs, FileReader, MouseEvent, HTMLAnchorElement */
const expectedClaimVersion = 'v0.1.0'
let isResultTabActive = false
let claimGlobal
let feedbackGlobal

let uuidNode = 1 // zero is root

// Init function. holds actions happening when the page is loading.
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

// This handler is called when the user selects a scenario with the "choose a scenario" combo box
function selectScenarioHandler () { // eslint-disable-line no-unused-vars
  // only refreshes results tab if it is selected
  if (isResultTabActive === true) {
    resfreshResultsTabContent()
  }
}

// Refreshes the results tab content according to user filtering selections, scenario, etc,...
function resfreshResultsTabContent () {
  hideAllResultsTabObjects()
  enableSendDownloadButton()
  isResultTabActive = true
  const selectScenarioComboBox = document.getElementById('selectScenarioComboBox')
  const selectedValue = selectScenarioComboBox.options[selectScenarioComboBox.selectedIndex].value
  if (selectedValue === 'all') {
    showAll()
  } else {
    document.getElementById('results-table').setAttribute('hidden', 'hidden')
    document.getElementById('myCheck-result').removeAttribute('hidden')
    document.getElementById('optional-checkbox').removeAttribute('hidden')
    document.getElementById('myCheck-mandatory').removeAttribute('hidden')
    document.getElementById('mandatory-checkbox').removeAttribute('hidden')
  }
  makeResultsTableVisible('optional')
  makeResultsTableVisible('mandatory')
}

// displays the optional or mandatory results tables depending on the selected scenario and
// whether the optional/mandatory checkboxes are checked
function makeResultsTableVisible (optionalMandatory) {
  const checkBox = document.getElementById(optionalMandatory + '-checkbox')
  const selectScenarioComboBox = document.getElementById('selectScenarioComboBox')
  const selectedValue = selectScenarioComboBox.options[selectScenarioComboBox.selectedIndex].value
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

// Filters test cases displayed in the results tab by state for a given selected scenario and for a given mandatory of optional table
function filterTestCasesBasedOnStateHandler (tableId, tableName, state, mandatoryOptional) { // eslint-disable-line no-unused-vars
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

// Show the results table for the scenario "All" including all test cases
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

// makes the "Download Results" button visible
function enableSendDownloadButton () {
  document.getElementById('download').removeAttribute('hidden')
  document.getElementById('downloadjsonHandler').removeAttribute('hidden')
  document.getElementById('UploadFeedback').removeAttribute('hidden')
}

// hides all result specific objects, including tables, buttons, checkboxes
function hideAllResultsTabObjects () {
  isResultTabActive = false

  document.getElementById('mandatory-far-edge-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-non-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-extended-table').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-telco-table').setAttribute('hidden', 'hidden')

  document.getElementById('optional-far-edge-table').setAttribute('hidden', 'hidden')
  document.getElementById('optional-non-telco-table').setAttribute('hidden', 'hidden')
  document.getElementById('optional-extended-table').setAttribute('hidden', 'hidden')

  document.getElementById('optional-telco-table').setAttribute('hidden', 'hidden')

  document.getElementById('optional-checkbox').setAttribute('hidden', 'hidden')
  document.getElementById('mandatory-checkbox').setAttribute('hidden', 'hidden')

  document.getElementById('download').setAttribute('hidden', 'hidden')
  document.getElementById('downloadjsonHandler').setAttribute('hidden', 'hidden')
  document.getElementById('UploadFeedback').setAttribute('hidden', 'hidden')

  document.getElementById('myCheck-result').setAttribute('hidden', 'hidden')

  document.getElementById('myCheck-mandatory').setAttribute('hidden', 'hidden')
}

// fills the "version" tab element with the data from the claim.json passed in input
function fillVersionsElement (input, element) {
  $(element).empty()
  $('<thead><tr><th scope="col">Component</th><th scope="col">Version</th></tr></thead><tbody>').appendTo($(element))
  for (const key in input) {
    $('<tr><td><b>' + key + '</b></td><td>' + input[key] + '</td></tr>').appendTo($(element))
  }
  $('</tbody>').appendTo($(element))
}

// gets the claim format version from the claim file
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

// fills the "metadata" tab element with the data from the claim.json passed in input
function fillMetadata (input, element) {
  $(element).empty()
  $('<tbody>').appendTo($(element))
  for (const key in input) {
    $('<tr><td><b>' + key + '</b></td><td>' + input[key] + '</td></tr>').appendTo($(element))
  }
  $('</tbody>').appendTo($(element))
}

// Mapping between internal table and display table names
const tableNameMap = {
  faredge: 'Far-Edge',
  telco: 'Telco',
  nontelco: 'Non-Telco',
  extended: 'Extended',
  all: 'All'
}

// computes test case statistics per state
function getTestCaseStats (claimJson, tableName) {
  let testsTotal = 0
  let testsPassed = 0
  let testsSkipped = 0
  let testsFailed = 0
  let testsAborted = 0
  let testsPassedOptional = 0
  let testsSkippedOptional = 0
  let testsFailedOptional = 0
  let testsAbortedOptional = 0
  // Compute number of passed/skipped/failed results
  for (const testIdFromClaim in claimJson) {
    const currentTestResult = claimJson[testIdFromClaim][0]
    let mandatoryOptional = currentTestResult.categoryClassification.FarEdge

    if (tableName === 'telco') {
      mandatoryOptional = currentTestResult.categoryClassification.Telco
    }
    if (tableName === 'nontelco') {
      mandatoryOptional = currentTestResult.categoryClassification.NonTelco
    }
    if (tableName === 'extended') {
      mandatoryOptional = currentTestResult.categoryClassification.Extended
    }

    if (currentTestResult.state === 'passed') {
      if (mandatoryOptional === 'Mandatory' || tableName === 'all') {
        testsTotal++
        testsPassed++
      } else {
        testsPassedOptional++
      }
    } else if (currentTestResult.state === 'skipped') {
      if (mandatoryOptional === 'Mandatory' || tableName === 'all') {
        testsTotal++
        testsSkipped++
      } else {
        testsSkippedOptional++
      }
    } else if (currentTestResult.state === 'failed') {
      if (mandatoryOptional === 'Mandatory' || tableName === 'all') {
        testsTotal++
        testsFailed++
      } else {
        testsFailedOptional++
      }
    } else if (currentTestResult.state === 'aborted') {
      if (mandatoryOptional === 'Mandatory' || tableName === 'all') {
        testsTotal++
        testsAborted++
      } else {
        testsAbortedOptional++
      }
    }
  }

  return {
    testsTotal,
    testsPassed,
    testsSkipped,
    testsFailed,
    testsAborted,
    testsPassedOptional,
    testsSkippedOptional,
    testsFailedOptional,
    testsAbortedOptional
  }
}

// generates HTML for test case stats element
function generateTestCasesStatsElement (tableElement, tableName, optionalMandatory, colorFailed, testsTotal, testsPassed, testsSkipped, testsFailed, testsAborted) {
  let testText = ''
  if (tableName === 'all') {
    testText = '<thead><tr><th style="width:15%" scope="col">Test summary (' + tableNameMap[tableName] + ')</th><th scope="col">Test feedback</th></tr></thead><tbody>'
  } else {
    testText = '<thead><tr><th style="width:15%" scope="col">' + optionalMandatory + ' Test  summary (' + tableNameMap[tableName] + ')</th><th scope="col">Test feedback</th></tr></thead><tbody>'
  }

  testText += '<tr><td class="align-top"><b>Total:</b> ' + testsTotal + '<br><b><tg>Passed:</tg></b> ' + testsPassed + ' '
  testText += '<input type="checkbox" id="filter-' + optionalMandatory + '-passed-' + tableName + '" checked onclick="filterTestCasesBasedOnStateHandler(\'' + tableElement + '\',\'' + tableName + '\', \'passed\',\'' + optionalMandatory + '\' )" >'
  testText += '<br><b><tgy>Skipped:</tgy></b> ' + testsSkipped + ' '
  testText += '<input type="checkbox" id="filter-' + optionalMandatory + '-skipped-' + tableName + '" checked onclick="filterTestCasesBasedOnStateHandler(\'' + tableElement + '\',\'' + tableName + '\', \'skipped\', \'' + optionalMandatory + '\' )" >'
  testText += '<br><b><' + colorFailed + '>Failed:</' + colorFailed + '></b> ' + testsFailed + ' '
  testText += '<input type="checkbox" id="filter-' + optionalMandatory + '-failed-' + tableName + '" checked onclick="filterTestCasesBasedOnStateHandler(\'' + tableElement + '\',\'' + tableName + '\', \'failed\', \'' + optionalMandatory + '\' )" >'
  testText += '<br><b><tpurple>Aborted:</tpurple></b> ' + testsAborted + ' '
  testText += '<input type="checkbox" id="filter-' + optionalMandatory + '-aborted-' + tableName + '" checked onclick="filterTestCasesBasedOnStateHandler(\'' + tableElement + '\',\'' + tableName + '\', \'aborted\', \'' + optionalMandatory + '\' )" >'
  testText += '</td><td>'
  testText += '<div class="accordion" id="results-accordion">'
  return testText
}

// generates HTML for a single testcase result
function generateTestcaseSingleResultElement (currentTestResult, tableName, id, mandatoryOptional) {
  const ansiUp = new AnsiUp()
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
    if (mandatoryOptional !== 'Optional' || tableName === 'all') {
      buttontype = 'bg-danger text-white'
    }
  }
  const itemid = 'collapse' + id
  const headingid = 'heading' + id
  commonTestTextContent += '<div data-id="' + testStatus + '" class="accordion-item"><h2 class="accordion-header" id="' + headingid + '"><button class="accordion-button collapsed ' + buttontype + '" type="button" data-bs-toggle="collapse" data-bs-target="#' + itemid + '" aria-expanded="true" aria-controls="' + itemid + '">'
  commonTestTextContent += currentTestResult.testID.id + '</button></h2>'
  // Now we should populate the item contents
  commonTestTextContent += '<div id="' + itemid + '" class="accordion-collapse collapse" aria-labelledby="' + headingid + '">'
  commonTestTextContent += '<div class="accordion-body" >'
  // Inside the accordion, 1 table with the following colummns. header below:
  commonTestTextContent += '<h1>Results</h1>'
  commonTestTextContent += '<div class="table-responsive">'
  commonTestTextContent += '<table id="myTable-' + currentTestResult.testID.id + '" class="table table-bordered"><thead><tr>'
  commonTestTextContent += '<th>Test ID</th>'
  commonTestTextContent += '<th class="th-lg">Test Text</th>'
  commonTestTextContent += '<th>Duration</th>'
  commonTestTextContent += '<th>State</th>'
  commonTestTextContent += '<th>Test output</th>'
  commonTestTextContent += '</tr></thead><tbody>'

  // content of the result table
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
  commonTestTextContent += '<tr><td  style="white-space: nowrap;">' + currentTestResult.testID.id + '</td>'
  commonTestTextContent += '<td class="th-lg">' + currentTestResult.catalogInfo.description.replace(/\n/g, '<br>') + '</td>'
  commonTestTextContent += '<td>' + formattedDuration + '</td>'
  commonTestTextContent += '<td><b>' + currentTestResult.state + '</b>' + skippedReason + '</td>'
  commonTestTextContent += '<td>' + ansiUp.ansi_to_html(ExtractLog(currentTestResult.capturedTestOutput)).replace(/\n/g, '<br>') + '</td></tr>'
  const jsonObjNonCompliant = NonCompliantReasonTextToJson(currentTestResult.capturedTestOutput)
  const jsonObjCompliant = CompliantReasonTextToJson(currentTestResult.capturedTestOutput)

  commonTestTextContent += '</tbody></table></div>'

  commonTestTextContent += '<h1>Feedback</h1><label>Write your feedback for ' + currentTestResult.testID.id + ' test case</label>'
  commonTestTextContent += '<textarea style="width: 100%; margin: 0 auto;" rows = "5" id="source-' + tableName + '-' + currentTestResult.testID.id + '" type="text"></textarea>'

  commonTestTextContent += '<h1>Non-Compliant objects</h1>'
  commonTestTextContent += createReasonTableAllTypes(jsonObjNonCompliant)
  commonTestTextContent += '<h1>Compliant objects</h1>'
  commonTestTextContent += createReasonTableAllTypes(jsonObjCompliant)
  commonTestTextContent += '</div></div></div>'
  return commonTestTextContent
}

// generates HTML for the table specified by tableName. If not table "All" it produces 2 elements, one for mandatory test and one for optional
function fillResults (claimJson, mandatoryTableElement, optionalTableElement, tableName) {
  // sorting according to state
  const sortedClaimJson = Object.entries(claimJson).sort(function (a, b) {
    const stringA = a[1][0].testID.id + a[1][0].state
    const stringB = b[1][0].testID.id + b[1][0].state
    return stringA.localeCompare(stringB)
  })
  const sortedClaimJsonObj = Object.fromEntries(sortedClaimJson)

  const stats = getTestCaseStats(claimJson, tableName)
  let testContentMandatory = generateTestCasesStatsElement(mandatoryTableElement, tableName, 'mandatory', 'tred', stats.testsTotal, stats.testsPassed, stats.testsSkipped, stats.testsFailed, stats.testsAborted)
  let testContentOptional = generateTestCasesStatsElement(optionalTableElement, tableName, 'optional', 'ty', stats.testsTotal, stats.testsPassedOptional, stats.testsSkippedOptional, stats.testsFailedOptional, stats.testsAbortedOptional)

  let id = 1
  for (const testIdFromSortedClaim in sortedClaimJsonObj) {
    const currentTestResult = claimJson[testIdFromSortedClaim][0]
    let mandatoryOptional = currentTestResult.categoryClassification.FarEdge

    if (tableName === 'telco') {
      mandatoryOptional = currentTestResult.categoryClassification.Telco
    }
    if (tableName === 'nontelco') {
      mandatoryOptional = currentTestResult.categoryClassification.NonTelco
    }
    if (tableName === 'extended') {
      mandatoryOptional = currentTestResult.categoryClassification.Extended
    }

    id += 1
    const commonTestContent = generateTestcaseSingleResultElement(currentTestResult, tableName, id, mandatoryOptional)
    if (mandatoryOptional === 'Mandatory' || tableName === 'all') {
      testContentMandatory += commonTestContent
    } else {
      testContentOptional += commonTestContent
    }
  }
  testContentMandatory += '</div></td></tr></tbody>'
  testContentOptional += '</div></td></tr></tbody>'
  $(testContentMandatory).appendTo($(mandatoryTableElement))
  if (tableName !== 'all') {
    $(testContentOptional).appendTo($(optionalTableElement))
  }
}

// render feedbac saved in JSON on HTML page
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

function saveTextAreaContent (key) {
  const selectScenarioComboBox = document.getElementById('selectScenarioComboBox')
  const tableName = selectScenarioComboBox.options[selectScenarioComboBox.selectedIndex].value
  const sourceId = 'source-' + tableName + '-' + key
  console.log(sourceId)
  const data = document.getElementById(sourceId).value
  document.getElementById(sourceId).textContent = data
}

// handler for version check modal
function handleFiles () {
  const fileList = this.files
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

// render results, but first check for claim format version
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

// fetches the claim file on a HTML server
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

// fetches the feedback file on a HTML server
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

// render results tab
function renderResults () {
  if (typeof claimGlobal !== 'undefined') {
    // Create treeview from JSON data
    let result = formatForFastTreeview(0, claimGlobal.claim.configurations, [])
    addOrphans(result.objectArray, '#config-table')
    result = formatForFastTreeview(0, claimGlobal.claim.nodes, [])
    addOrphans(result.objectArray, '#nodes-table')
    fillMetadata(claimGlobal.claim.metadata, '#metadata-table')
    fillVersionsElement(claimGlobal.claim.versions, '#versions-table')
    fillResults(claimGlobal.claim.results, '#results-table', '#optional-', 'all')
    fillResults(claimGlobal.claim.results, '#mandatory-far-edge-table', '#optional-far-edge-table', 'faredge')
    fillResults(claimGlobal.claim.results, '#mandatory-telco-table', '#optional-telco-table', 'telco')
    fillResults(claimGlobal.claim.results, '#mandatory-non-telco-table', '#optional-non-telco-table', 'nontelco')
    fillResults(claimGlobal.claim.results, '#mandatory-extended-table', '#optional-extended-table', 'extended')
    if (typeof feedbackGlobal !== 'undefined') {
      fillFeedback(feedbackGlobal)
    }
  }
}

// converts a linked style to a css rules object
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

// return static version of the HTML results
function getHtmlResults () {
  let selectScenarioComboBox = document.getElementById('selectScenarioComboBox')

  const doc = document.implementation.createHTMLDocument()
  const head = doc.head
  const body = doc.body
  selectScenarioComboBox = document.getElementById('selectScenarioComboBox')
  insertResults(body, 'mandatory')
  if (selectScenarioComboBox.value !== 'all') {
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

function downloadjsonHandler () { // eslint-disable-line no-unused-vars
  const dict = {}
  const tablesName = ['all', 'telco', 'nontelco', 'extended', 'faredge'] // to go over all the feedback and save it
  for (const key in claimGlobal.claim.results) {
    for (let i = 0; i < tablesName.length; i++) {
      const keydict = 'source-' + tablesName[i] + '-' + key
      const data = document.getElementById(keydict)
      if (data !== null) {
        dict[keydict] = data.value
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

// makes a static copy of test results
function download () { // eslint-disable-line no-unused-vars
  // safeguards all feedback by copying value into textarea text
  for (const key in claimGlobal.claim.results) {
    saveTextAreaContent(key)
  }

  const pom = document.createElement('a')
  pom.setAttribute('href', 'data:text/html;charset=UTF-8,' + encodeURIComponent(getHtmlResults()))
  pom.setAttribute('download', 'results-feedback')

  pom.style.display = 'none'
  document.body.appendChild(pom)

  pom.click()

  document.body.removeChild(pom)
}

// insert a copy of the selected scenario's results
function insertResults (body, optionalMandatory) {
  const checkBox = document.getElementById(optionalMandatory + '-checkbox')
  const selectScenarioComboBox = document.getElementById('selectScenarioComboBox')
  const selectedValue = selectScenarioComboBox.value
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

// Recursive function for displaying a tree of configuration objects
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

// return true if this treeview object does not have a parent (orphan)
function orphans (data) {
  return data.filter(function (item) {
    return item.parent === '0'
  })
}

// returns true if an item has children
function hasChildren (data, parentId) {
  return data.some(function (item) {
    return item.parent === parentId
  })
}

// Gets children items
function getChildren (data, parentId) {
  return data.filter(function (item) {
    return item.parent === parentId
  })
}

// generates a single list item
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

// event listener to support expanding children items on click
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

// event listerner for collapsing items
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

// create top level HTML object for tree view (e.g. all the parent-less/orphan objects )
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

// recursive function to expand all the tree view items starting from one item
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

// check if the object is a html link
function isAnchorElement (obj) {
  return obj instanceof HTMLAnchorElement
}

// recursive function to count the number of tree view items, under an items (its children). This is used to compute the 100% value of the progress bar
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

// update the progress bar to a value
function updateProgressBar (value) {
  const progressBar = document.querySelector('.progress-bar')
  const strippedStr = progressBar.style.width.replace(/%/g, '')
  const currentValue = parseInt(strippedStr)
  if (value >= currentValue + 2) {
    progressBar.style.width = value.toString() + '%'
  }
}

// Initalize the progress bar to 0%
function initProgressBar () {
  const progressBar = document.querySelector('.progress-bar')
  progressBar.style.width = '0%'
}
