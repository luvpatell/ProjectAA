document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = window.location.origin;

  const authSection = document.getElementById('authSection');
  const dashboardWrapper = document.getElementById('dashboardWrapper');

  const loginForm = document.getElementById('loginForm');
  const devUsernameInput = document.getElementById('devUsername');
  const devPasswordInput = document.getElementById('devPassword');
  const loginBtn = document.getElementById('loginBtn');

  const loginErrorAlert = document.getElementById('loginErrorAlert');
  const loginErrorMsg = document.getElementById('loginErrorMsg');

  const togglePasswordBtn =
    document.getElementById('togglePasswordBtn');

  const togglePasswordIcon =
    document.getElementById('togglePasswordIcon');

  const logoutBtn =
    document.getElementById('logoutBtn');

  const refreshDataBtn =
    document.getElementById('refreshDataBtn');

  const loadDemoDataBtn =
    document.getElementById('loadDemoDataBtn');

  const emptyDemoBtn =
    document.getElementById('emptyDemoBtn');

  const exportCsvBtn =
    document.getElementById('exportCsvBtn');

  const clearAllOrdersBtn =
    document.getElementById('clearAllOrdersBtn');

  const totalVisitsCount =
    document.getElementById('totalVisitsCount');

  const totalOrdersCount =
    document.getElementById('totalOrdersCount');

  const pendingOrdersCount =
    document.getElementById('pendingOrdersCount');

  const completedOrdersCount =
    document.getElementById('completedOrdersCount');

  const ordersTableBody =
    document.getElementById('ordersTableBody');

  const emptyOrdersState =
    document.getElementById('emptyOrdersState');

  const showingCountText =
    document.getElementById('showingCountText');

  const orderSearchInput =
    document.getElementById('orderSearchInput');

  const departmentFilterSelect =
    document.getElementById('departmentFilterSelect');

  const statusFilterSelect =
    document.getElementById('statusFilterSelect');

  let departmentChartInstance = null;
  let trendChartInstance = null;


  /* =========================================================
     LOGIN / SESSION
     ========================================================= */

  const getToken = () => {
    return sessionStorage.getItem('projecta_dev_token');
  };


  const showLogin = () => {

    if (dashboardWrapper) {
      dashboardWrapper.style.display = 'none';
    }

    if (authSection) {
      authSection.style.display = 'flex';
    }

    if (devUsernameInput) {
      devUsernameInput.value = '';
    }

    if (devPasswordInput) {
      devPasswordInput.value = '';
    }

    if (loginErrorAlert) {
      loginErrorAlert.hidden = true;
    }

    setTimeout(() => {
      devUsernameInput?.focus();
    }, 100);

  };


  const showDashboard = () => {

    if (authSection) {
      authSection.style.display = 'none';
    }

    if (dashboardWrapper) {
      dashboardWrapper.style.display = 'block';
    }

    renderDashboard();

  };


  const verifySession = async () => {

    const token = getToken();

    if (!token) {
      showLogin();
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE}/api/verify`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          cache: 'no-store',

          body: JSON.stringify({
            token: token
          })
        }
      );

      if (!response.ok) {

        sessionStorage.removeItem(
          'projecta_dev_token'
        );

        showLogin();
        return;
      }

      const data = await response.json();

      if (data.valid === true) {
        showDashboard();
      } else {

        sessionStorage.removeItem(
          'projecta_dev_token'
        );

        showLogin();
      }

    } catch (error) {

      console.error(
        'Session verification error:',
        error
      );

      sessionStorage.removeItem(
        'projecta_dev_token'
      );

      showLogin();
    }

  };


  /* =========================================================
     PASSWORD TOGGLE
     ========================================================= */

  if (
    togglePasswordBtn &&
    devPasswordInput
  ) {

    togglePasswordBtn.addEventListener(
      'click',
      () => {

        const currentType =
          devPasswordInput.getAttribute('type');

        const newType =
          currentType === 'password'
            ? 'text'
            : 'password';

        devPasswordInput.setAttribute(
          'type',
          newType
        );

        if (togglePasswordIcon) {

          togglePasswordIcon.className =
            newType === 'password'
              ? 'fa-regular fa-eye'
              : 'fa-regular fa-eye-slash';

        }

      }
    );

  }


  /* =========================================================
     LOGIN
     ========================================================= */

  if (loginForm) {

    loginForm.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();

        const username =
          devUsernameInput?.value.trim() || '';

        const password =
          devPasswordInput?.value.trim() || '';

        if (!username || !password) {

          if (loginErrorAlert) {
            loginErrorAlert.hidden = false;
          }

          if (loginErrorMsg) {
            loginErrorMsg.textContent =
              'Please enter username and password.';
          }

          return;
        }


        if (loginBtn) {

          loginBtn.disabled = true;
          loginBtn.classList.add('loading');

        }


        if (loginErrorAlert) {
          loginErrorAlert.hidden = true;
        }


        try {

          console.log(
            '[ProjectA] Sending login request to:',
            `${API_BASE}/api/login`
          );


          const response = await fetch(
            `${API_BASE}/api/login`,
            {
              method: 'POST',

              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },

              cache: 'no-store',

              body: JSON.stringify({
                user: username,
                pass: password
              })
            }
          );


          console.log(
            '[ProjectA] Login response:',
            response.status
          );


          let data = {};

          try {
            data = await response.json();
          } catch (jsonError) {
            console.error(
              'Invalid JSON response:',
              jsonError
            );
          }


          /* SUCCESS */

          if (
            response.ok &&
            data.success === true &&
            data.token
          ) {

            sessionStorage.setItem(
              'projecta_dev_token',
              data.token
            );

            sessionStorage.setItem(
              'projecta_dev_user',
              username
            );


            if (loginErrorAlert) {
              loginErrorAlert.hidden = true;
            }


            if (devPasswordInput) {
              devPasswordInput.value = '';
            }


            showDashboard();

            return;
          }


          /* LOCKED */

          if (
            response.status === 429 ||
            data.locked === true
          ) {

            if (loginErrorAlert) {
              loginErrorAlert.hidden = false;
            }

            if (loginErrorMsg) {
              loginErrorMsg.textContent =
                data.message ||
                'Too many failed login attempts. Please try again later.';
            }

            return;
          }


          /* METHOD ERROR */

          if (response.status === 405) {

            if (loginErrorAlert) {
              loginErrorAlert.hidden = false;
            }

            if (loginErrorMsg) {
              loginErrorMsg.textContent =
                'Login request method error. Please open the Developer Portal from localhost:3000.';
            }

            return;
          }


          /* INVALID LOGIN */

          if (response.status === 401) {

            if (loginErrorAlert) {
              loginErrorAlert.hidden = false;
            }

            if (loginErrorMsg) {
              loginErrorMsg.textContent =
                data.message ||
                'Invalid username or password.';
            }

            if (devPasswordInput) {
              devPasswordInput.value = '';
              devPasswordInput.focus();
            }

            return;
          }


          /* OTHER SERVER ERROR */

          if (loginErrorAlert) {
            loginErrorAlert.hidden = false;
          }

          if (loginErrorMsg) {
            loginErrorMsg.textContent =
              data.message ||
              `Server error (${response.status}).`;
          }

        } catch (error) {

          console.error(
            '[ProjectA] Login error:',
            error
          );


          if (loginErrorAlert) {
            loginErrorAlert.hidden = false;
          }

          if (loginErrorMsg) {
            loginErrorMsg.textContent =
              'Cannot connect to ProjectA server. Make sure node server.js is running.';
          }

        } finally {

          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
          }

        }

      }
    );

  }


  /* =========================================================
     LOGOUT
     ========================================================= */

  if (logoutBtn) {

    logoutBtn.addEventListener(
      'click',
      () => {

        const confirmed =
          confirm(
            'Are you sure you want to log out of the Developer Portal?'
          );

        if (!confirmed) {
          return;
        }

        sessionStorage.removeItem(
          'projecta_dev_token'
        );

        sessionStorage.removeItem(
          'projecta_dev_user'
        );

        showLogin();

      }
    );

  }


  /* =========================================================
     ORDERS
     ========================================================= */

  const getOrders = () => {

    try {

      const stored =
        localStorage.getItem(
          'projecta_orders'
        );

      if (!stored) {
        return [];
      }

      const allOrders =
        JSON.parse(stored);

      if (!Array.isArray(allOrders)) {
        return [];
      }

      const DEMO_IDS = [
        'ORD-1078',
        'ORD-1079',
        'ORD-1080',
        'ORD-1081',
        'ORD-1082'
      ];

      const realOrders =
        allOrders.filter(
          order =>
            !DEMO_IDS.includes(order.id)
        );


      if (
        realOrders.length !==
        allOrders.length
      ) {

        localStorage.setItem(
          'projecta_orders',
          JSON.stringify(realOrders)
        );

      }


      return realOrders;

    } catch (error) {

      console.error(
        'Error reading orders:',
        error
      );

      return [];

    }

  };


  const saveOrders = (orders) => {

    localStorage.setItem(
      'projecta_orders',
      JSON.stringify(orders)
    );

  };


  const getVisits = () => {

    return parseInt(
      localStorage.getItem(
        'projecta_visits'
      ) || '0',
      10
    );

  };


  /* =========================================================
     DASHBOARD
     ========================================================= */

  const renderDashboard = () => {

    const orders = getOrders();
    const visits = getVisits();

    const totalOrders =
      orders.length;

    const pendingOrders =
      orders.filter(
        order =>
          order.status === 'New' ||
          order.status === 'In Progress'
      ).length;

    const completedOrders =
      orders.filter(
        order =>
          order.status === 'Completed'
      ).length;


    if (totalVisitsCount) {

      totalVisitsCount.textContent =
        visits.toLocaleString('en-IN');

    }


    if (totalOrdersCount) {

      totalOrdersCount.textContent =
        totalOrders.toLocaleString('en-IN');

    }


    if (pendingOrdersCount) {

      pendingOrdersCount.textContent =
        pendingOrders.toLocaleString('en-IN');

    }


    if (completedOrdersCount) {

      completedOrdersCount.textContent =
        completedOrders.toLocaleString('en-IN');

    }


    const currentDevUser =
      document.getElementById(
        'currentDevUser'
      );

    if (currentDevUser) {

      currentDevUser.textContent =
        sessionStorage.getItem(
          'projecta_dev_user'
        ) || '';

    }


    renderDepartmentChart(
      orders
    );

    renderTrendChart(
      visits,
      orders
    );

    renderOrdersTable();

  };


  /* =========================================================
     DEPARTMENT CHART
     ========================================================= */

  const renderDepartmentChart =
    (orders) => {

      const canvas =
        document.getElementById(
          'departmentChart'
        );

      if (
        !canvas ||
        typeof Chart === 'undefined'
      ) {
        return;
      }


      const ctx =
        canvas.getContext('2d');


      const deptCounts = {};


      orders.forEach(
        order => {

          const department =
            order.department ||
            'Other';

          deptCounts[department] =
            (deptCounts[department] || 0) +
            1;

        }
      );


      const labels =
        Object.keys(deptCounts);

      const data =
        Object.values(deptCounts);


      const chartLabels =
        labels.length
          ? labels
          : ['No Orders Yet'];


      const chartData =
        data.length
          ? data
          : [1];


      const chartColors =
        data.length
          ? [
              '#0066FF',
              '#00D2FF',
              '#10B981',
              '#F59E0B',
              '#8B5CF6',
              '#EC4899',
              '#6366F1',
              '#14B8A6'
            ]
          : [
              '#e2e8f0'
            ];


      if (departmentChartInstance) {
        departmentChartInstance.destroy();
      }


      departmentChartInstance =
        new Chart(
          ctx,
          {
            type: 'doughnut',

            data: {
              labels: chartLabels,

              datasets: [
                {
                  data: chartData,

                  backgroundColor:
                    chartColors.slice(
                      0,
                      chartLabels.length
                    ),

                  borderWidth: 2,

                  borderColor:
                    '#ffffff',

                  hoverOffset: 6
                }
              ]
            },

            options: {
              responsive: true,

              maintainAspectRatio:
                false,

              plugins: {

                legend: {
                  position: 'right',

                  labels: {
                    boxWidth: 12,

                    font: {
                      size: 11,
                      family:
                        'Plus Jakarta Sans'
                    }
                  }
                },

                tooltip: {

                  callbacks: {

                    label:
                      function(context) {

                        return `${context.label}: ${context.raw} Orders`;

                      }

                  }

                }

              },

              cutout: '62%'

            }

          }
        );

    };


  /* =========================================================
     TREND CHART
     ========================================================= */

  const renderTrendChart =
    (
      visits,
      orders
    ) => {

      const canvas =
        document.getElementById(
          'trendChart'
        );

      if (
        !canvas ||
        typeof Chart === 'undefined'
      ) {
        return;
      }


      const ctx =
        canvas.getContext('2d');


      if (trendChartInstance) {
        trendChartInstance.destroy();
      }


      trendChartInstance =
        new Chart(
          ctx,
          {
            type: 'bar',

            data: {

              labels: [
                'Website Visits',
                'Total Orders',
                'In Progress',
                'Completed Projects'
              ],

              datasets: [

                {

                  label: 'Count',

                  data: [

                    visits,

                    orders.length,

                    orders.filter(
                      order =>
                        order.status === 'New' ||
                        order.status === 'In Progress'
                    ).length,

                    orders.filter(
                      order =>
                        order.status === 'Completed'
                    ).length

                  ],

                  backgroundColor: [
                    'rgba(0, 102, 255, 0.85)',
                    'rgba(0, 210, 255, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                    'rgba(16, 185, 129, 0.85)'
                  ],

                  borderRadius: 8,

                  borderSkipped: false

                }

              ]

            },

            options: {

              responsive: true,

              maintainAspectRatio:
                false,

              plugins: {

                legend: {
                  display: false
                }

              },

              scales: {

                y: {

                  beginAtZero: true,

                  ticks: {

                    precision: 0,

                    font: {
                      family:
                        'Plus Jakarta Sans'
                    }

                  },

                  grid: {
                    color: '#f1f5f9'
                  }

                },

                x: {

                  grid: {
                    display: false
                  },

                  ticks: {

                    font: {
                      family:
                        'Plus Jakarta Sans',

                      weight: '600'
                    }

                  }

                }

              }

            }

          }
        );

    };


  /* =========================================================
     ORDERS TABLE
     ========================================================= */

  const renderOrdersTable =
    () => {

      const allOrders =
        getOrders();


      const searchQuery =
        orderSearchInput?.value
          .toLowerCase()
          .trim() || '';


      const deptFilter =
        departmentFilterSelect?.value ||
        'ALL';


      const statusFilter =
        statusFilterSelect?.value ||
        'ALL';


      const filteredOrders =
        allOrders.filter(
          order => {

            const matchesSearch =

              (
                order.studentName &&
                order.studentName
                  .toLowerCase()
                  .includes(searchQuery)
              )

              ||

              (
                order.phone &&
                order.phone
                  .includes(searchQuery)
              )

              ||

              (
                order.email &&
                order.email
                  .toLowerCase()
                  .includes(searchQuery)
              )

              ||

              (
                order.topic &&
                order.topic
                  .toLowerCase()
                  .includes(searchQuery)
              )

              ||

              (
                order.id &&
                order.id
                  .toLowerCase()
                  .includes(searchQuery)
              );


            const matchesDept =
              deptFilter === 'ALL' ||
              (
                order.department &&
                order.department.includes(
                  deptFilter
                )
              );


            const matchesStatus =
              statusFilter === 'ALL' ||
              order.status === statusFilter;


            return (
              matchesSearch &&
              matchesDept &&
              matchesStatus
            );

          }
        );


      if (showingCountText) {

        showingCountText.textContent =
          `Showing ${filteredOrders.length} of ${allOrders.length} orders`;

      }


      if (
        filteredOrders.length === 0
      ) {

        if (ordersTableBody) {
          ordersTableBody.innerHTML = '';
        }

        if (emptyOrdersState) {
          emptyOrdersState.style.display =
            'block';
        }

        return;

      }


      if (emptyOrdersState) {
        emptyOrdersState.style.display =
          'none';
      }


      if (!ordersTableBody) {
        return;
      }


      ordersTableBody.innerHTML =
        filteredOrders
          .map(
            order => {

              let statusClass =
                'status-new';


              if (
                order.status ===
                'In Progress'
              ) {

                statusClass =
                  'status-progress';

              }


              if (
                order.status ===
                'Completed'
              ) {

                statusClass =
                  'status-completed';

              }


              if (
                order.status ===
                'Cancelled'
              ) {

                statusClass =
                  'status-cancelled';

              }


              const rawPhone =
                order.phone
                  ? order.phone.replace(
                      /\D/g,
                      ''
                    )
                  : '';


              const phoneDigits =
                rawPhone.length === 10
                  ? '91' + rawPhone
                  : rawPhone;


              const waMessage =
                `Hello ${order.studentName || 'Student'}! Regarding your project order with ProjectA (${order.department || 'your department'}):`;


              const waLink =
                `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(waMessage)}`;


              return `

                <tr data-order-id="${order.id || ''}">

                  <td>

                    <span class="order-id">
                      ${order.id || '#ORD'}
                    </span>

                  </td>


                  <td>

                    <div style="font-weight:600;color:#0f172a;">
                      ${order.date || 'Today'}
                    </div>

                    <small style="color:#64748b;">
                      ${order.time || ''}
                    </small>

                  </td>


                  <td>

                    <div class="student-info">

                      <strong>
                        ${order.studentName || 'N/A'}
                      </strong>

                      <small>
                        <i
                          class="fa-solid fa-phone"
                          style="font-size:0.75rem;"
                        ></i>
                        ${order.phone || ''}
                      </small>

                      <br>

                      <small>
                        <i
                          class="fa-regular fa-envelope"
                          style="font-size:0.75rem;"
                        ></i>
                        ${order.email || ''}
                      </small>

                    </div>

                  </td>


                  <td>

                    <span
                      style="font-weight:700;color:#0066ff;"
                    >
                      ${order.department || 'N/A'}
                    </span>

                  </td>


                  <td>

                    <div
                      class="topic-box"
                      title="${(order.topic || '').replace(/"/g, '&quot;')}"
                    >
                      ${order.topic || 'No details provided'}
                    </div>

                  </td>


                  <td>

                    <select
                      class="status-select ${statusClass}"
                      onchange="window.updateOrderStatus('${order.id}', this.value)"
                    >

                      <option
                        value="New"
                        ${order.status === 'New' ? 'selected' : ''}
                      >
                        New
                      </option>

                      <option
                        value="In Progress"
                        ${order.status === 'In Progress' ? 'selected' : ''}
                      >
                        In Progress
                      </option>

                      <option
                        value="Completed"
                        ${order.status === 'Completed' ? 'selected' : ''}
                      >
                        Completed
                      </option>

                      <option
                        value="Cancelled"
                        ${order.status === 'Cancelled' ? 'selected' : ''}
                      >
                        Cancelled
                      </option>

                    </select>

                  </td>


                  <td>

                    <div class="actions-wrap">

                      <a
                        href="${waLink}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-action-wa"
                        title="Chat with student on WhatsApp"
                      >

                        <i class="fa-brands fa-whatsapp"></i>
                        Chat

                      </a>


                      <button
                        type="button"
                        class="btn-action-delete"
                        onclick="window.deleteOrder('${order.id}')"
                        title="Delete Order"
                      >

                        <i class="fa-regular fa-trash-can"></i>

                      </button>

                    </div>

                  </td>

                </tr>

              `;

            }
          )
          .join('');

    };


  /* =========================================================
     UPDATE ORDER STATUS
     ========================================================= */

  window.updateOrderStatus =
    (
      orderId,
      newStatus
    ) => {

      const orders =
        getOrders();


      const target =
        orders.find(
          order =>
            order.id === orderId
        );


      if (!target) {
        return;
      }


      const previousStatus =
        target.status;


      target.status =
        newStatus;


      saveOrders(
        orders
      );

      renderDashboard();


      if (
        newStatus !== previousStatus &&
        target.phone
      ) {

        const rawPhone =
          target.phone.replace(
            /\D/g,
            ''
          );


        const phoneDigits =
          rawPhone.length === 10
            ? '91' + rawPhone
            : rawPhone;


        const name =
          target.studentName ||
          'Student';


        const dept =
          target.department ||
          'your department';


        const id =
          target.id;


        let message = '';


        if (
          newStatus ===
          'In Progress'
        ) {

          message =
            `Hello ${name}! 🚀 Your college project order (${id} - ${dept}) is now *IN PROGRESS* at ProjectA. Our team has started working on it. We will keep you updated!\n\n— Team ProjectA`;

        }


        else if (
          newStatus ===
          'Completed'
        ) {

          message =
            `Hello ${name}! 🎉 Great news! Your college project order (${id} - ${dept}) is *COMPLETED* at ProjectA and is ready for delivery. Please contact us to collect your project!\n\n— Team ProjectA`;

        }


        else if (
          newStatus ===
          'Cancelled'
        ) {

          message =
            `Hello ${name}! ⚠️ Your college project order (${id}) at ProjectA has been *CANCELLED*. Please contact us at +91 97147 11897 or support.projecta@gmail.com for more details.\n\n— Team ProjectA`;

        }


        if (message) {

          const whatsappUrl =
            `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(message)}`;

          window.open(
            whatsappUrl,
            '_blank'
          );

        }

      }

    };


  /* =========================================================
     DELETE ORDER
     ========================================================= */

  window.deleteOrder =
    (orderId) => {

      if (
        !confirm(
          `Delete project order ${orderId}?`
        )
      ) {
        return;
      }


      let orders =
        getOrders();


      orders =
        orders.filter(
          order =>
            order.id !== orderId
        );


      saveOrders(
        orders
      );

      renderDashboard();

    };


  /* =========================================================
     FILTERS
     ========================================================= */

  if (orderSearchInput) {

    orderSearchInput.addEventListener(
      'input',
      renderOrdersTable
    );

  }


  if (departmentFilterSelect) {

    departmentFilterSelect.addEventListener(
      'change',
      renderOrdersTable
    );

  }


  if (statusFilterSelect) {

    statusFilterSelect.addEventListener(
      'change',
      renderOrdersTable
    );

  }


  /* =========================================================
     REFRESH
     ========================================================= */

  if (refreshDataBtn) {

    refreshDataBtn.addEventListener(
      'click',
      () => {

        renderDashboard();

        alert(
          'Dashboard refreshed with latest data!'
        );

      }
    );

  }


  /* =========================================================
     DEMO DATA
     ========================================================= */

  const loadDemoOrders =
    () => {

      localStorage.removeItem(
        'projecta_orders'
      );

      getOrders();

      renderDashboard();

      alert(
        'Sample project orders and visits loaded successfully!'
      );

    };


  if (loadDemoDataBtn) {

    loadDemoDataBtn.addEventListener(
      'click',
      loadDemoOrders
    );

  }


  if (emptyDemoBtn) {

    emptyDemoBtn.addEventListener(
      'click',
      loadDemoOrders
    );

  }


  /* =========================================================
     CLEAR ORDERS
     ========================================================= */

  if (clearAllOrdersBtn) {

    clearAllOrdersBtn.addEventListener(
      'click',
      () => {

        if (
          !confirm(
            'Are you sure you want to clear all project orders?'
          )
        ) {
          return;
        }


        saveOrders([]);

        renderDashboard();

      }
    );

  }


  /* =========================================================
     EXPORT CSV
     ========================================================= */

  if (exportCsvBtn) {

    exportCsvBtn.addEventListener(
      'click',
      () => {

        const orders =
          getOrders();


        if (
          orders.length === 0
        ) {

          alert(
            'No orders available to export.'
          );

          return;

        }


        let csvContent =
          'Order ID,Date,Time,Student Name,Phone,Email,Department,Topic,Status\n';


        orders.forEach(
          order => {

            const cleanTopic =
              (order.topic || '')
                .replace(
                  /"/g,
                  '""'
                )
                .replace(
                  /\n/g,
                  ' '
                );


            csvContent +=
              `"${order.id || ''}","${order.date || ''}","${order.time || ''}","${order.studentName || ''}","${order.phone || ''}","${order.email || ''}","${order.department || ''}","${cleanTopic}","${order.status || ''}"\n`;

          }
        );


        const blob =
          new Blob(
            [csvContent],
            {
              type:
                'text/csv;charset=utf-8;'
            }
          );


        const url =
          URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            'a'
          );


        link.href =
          url;


        link.download =
          `ProjectA_Orders_${new Date().toISOString().slice(0, 10)}.csv`;


        document.body.appendChild(
          link
        );


        link.click();


        document.body.removeChild(
          link
        );


        URL.revokeObjectURL(
          url
        );

      }
    );

  }


  /* =========================================================
     START
     ========================================================= */

  verifySession();

});