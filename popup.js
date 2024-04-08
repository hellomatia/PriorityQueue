document.addEventListener('DOMContentLoaded', function() {
  const addScheduleBtn = document.getElementById('addSchedule');
  const newScheduleInput = document.getElementById('newSchedule');
  const scheduleList = document.getElementById('scheduleList');

  // 일정 추가 버튼 클릭 이벤트
  // 일정 추가 버튼 클릭 이벤트
addScheduleBtn.onclick = addSchedule;

// 엔터 키 이벤트
document.getElementById('newSchedule').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // 폼 제출 방지
    addSchedule();
  }
});

function addSchedule() {
  const scheduleText = newScheduleInput.value.trim();
  if (scheduleText) {
    const newSchedule = { id: Date.now(), text: scheduleText, completed: false };
    saveSchedule(newSchedule);
    newScheduleInput.value = ''; // 입력 필드 초기화
    renderActiveSchedules();
  }
}


  // 일정 목록 로드
  renderActiveSchedules();

  // 완료된 일정과 진행 중인 일정 보기 버튼에 이벤트 리스너 추가
  document.getElementById('showCompletedSchedules').addEventListener('click', function() {
    renderCompletedSchedules(); // 완료된 일정만 보여주기
  });
  document.getElementById('showActiveSchedules').addEventListener('click', function() {
    renderActiveSchedules(); // 진행 중인 일정만 보여주기
  });
});




// 일정 저장
function saveSchedule(schedule) {
  let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
  schedules.push(schedule);
  localStorage.setItem('schedules', JSON.stringify(schedules));
}

// 일정 목록 렌더링
function renderActiveSchedules() {
  const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
  const scheduleList = document.getElementById('scheduleList');
  scheduleList.innerHTML = ''; // 목록 초기화

  schedules.forEach(schedule => {
      const scheduleElement = document.createElement('div');
      scheduleElement.className = 'schedule-item d-flex justify-content-between align-items-center';
      scheduleElement.setAttribute('data-id', schedule.id);

      const textSpan = document.createElement('span');
      textSpan.textContent = schedule.text;
      scheduleElement.appendChild(textSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.textContent = '삭제';
      deleteBtn.onclick = function() {
          deleteSchedule(schedule.id);
      };
      scheduleElement.appendChild(deleteBtn);

      scheduleList.appendChild(scheduleElement);
  });

  enableDragAndDrop();
}

// 일정 삭제
function deleteSchedule(scheduleId) {
  let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
  schedules = schedules.filter(schedule => schedule.id !== scheduleId);
  localStorage.setItem('schedules', JSON.stringify(schedules));
  renderActiveSchedules();
}

// 완료된 일정 삭제
function deleteCompletedSchedule(scheduleId) {
  let completedSchedules = JSON.parse(localStorage.getItem('completedSchedules')) || [];
  completedSchedules = completedSchedules.filter(schedule => schedule.id !== scheduleId);
  localStorage.setItem('completedSchedules', JSON.stringify(completedSchedules));
  renderCompletedSchedules();
}

// 순서 변경 후 로컬 스토리지 업데이트 (예시 로직, 실제 구현 필요)
function enableDragAndDrop() {
const schedules = document.querySelectorAll('.schedule-item');
schedules.forEach(schedule => {
    schedule.draggable = true;
    schedule.addEventListener('dragstart', handleDragStart, false);
    schedule.addEventListener('dragover', handleDragOver, false);
    schedule.addEventListener('drop', handleDrop, false);
    schedule.addEventListener('dragend', handleDragEnd, false);
});
}

let dragStartX = 0; // 드래그 시작 지점의 X 좌표
let dragSrcEl = null; // 드래그 시작 요소

function handleDragStart(e) {
  dragSrcEl = this;
  dragStartX = e.clientX; // 드래그 시작 지점의 X 좌표 저장
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
}
e.dataTransfer.dropEffect = 'move';
return false;
}

function handleDrop(e) {
if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
}
if (dragSrcEl !== this) {
    // Swap the HTML of the dragged and target elements
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');

    // Update the local storage with new order
    updateScheduleOrder();
}
return false;
}

function handleDragEnd(e) {
const dragEndX = e.clientX; // 드래그 종료 지점의 X 좌표
if (Math.abs(dragEndX - dragStartX) > 100) { // 일정한 거리(예: 100px) 이상 옆으로 이동했는지 확인
  moveToCompleted(this.getAttribute('data-id')); // 완료된 일정으로 이동
}
// 기존 드래그 종료 로직
}

function moveToCompleted(scheduleId) {
  let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
  const scheduleIndex = schedules.findIndex(s => s.id.toString() === scheduleId);
  if (scheduleIndex > -1) {
      const [completedSchedule] = schedules.splice(scheduleIndex, 1); // 일정 삭제
      completedSchedule.completed = true; // 완료 상태로 변경
      localStorage.setItem('schedules', JSON.stringify(schedules)); // 변경된 일정 목록 저장

      let completedSchedules = JSON.parse(localStorage.getItem('completedSchedules')) || [];
      completedSchedules.push(completedSchedule); // 완료된 일정 목록에 추가
      localStorage.setItem('completedSchedules', JSON.stringify(completedSchedules)); // 변경된 완료된 일정 목록 저장

      renderActiveSchedules(); // 일정 목록 다시 렌더링
  }
}

function updateScheduleOrder() {
  const schedules = document.querySelectorAll('.schedule-item');
  let newOrder = [];
  schedules.forEach(schedule => {
    const id = schedule.getAttribute('data-id');
    // textContent에서 '삭제' 버튼의 텍스트도 포함되므로, 첫 번째 자식 요소(일정 텍스트를 담고 있는 span)의 텍스트만 가져오도록 수정
    const text = schedule.firstChild.textContent;
    const completed = JSON.parse(localStorage.getItem('schedules')).find(s => s.id.toString() === id).completed;
    newOrder.push({ id, text, completed }); // 재정렬된 일정 목록 생성
  });
  localStorage.setItem('schedules', JSON.stringify(newOrder)); // 로컬 스토리지에 저장
  renderActiveSchedules(); // 일정 목록 다시 렌더링
}

function renderCompletedSchedules() {
const completedSchedules = JSON.parse(localStorage.getItem('completedSchedules')) || [];
const scheduleList = document.getElementById('scheduleList');
scheduleList.innerHTML = ''; // 목록 초기화

completedSchedules.forEach(schedule => {
  const scheduleElement = document.createElement('div');
  scheduleElement.textContent = schedule.text;
  scheduleElement.className = 'completed-schedule-item d-flex justify-content-between align-items-center';
  scheduleElement.setAttribute('data-id', schedule.id);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger btn-sm';
  deleteBtn.textContent = '삭제';
  deleteBtn.onclick = function() {
      deleteCompletedSchedule(schedule.id);
  };
  scheduleElement.appendChild(deleteBtn);

  scheduleList.appendChild(scheduleElement);
});
}