document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Sending an email
  document.querySelector('#compose-form').onsubmit = () => {
    
    
    send_email(
      document.querySelector("#compose-recipients").value,
      document.querySelector("#compose-subject").value,
      document.querySelector("#compose-body").value,
      load_mailbox
    );

    // stop form from submitting
    return false;
  };
    

});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
};




function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // List the related email
  list_email(mailbox);

};

// a function for sending an email 
function send_email(recipients, subject, body, myCallback) {

  const data ={
    recipients:`${recipients}`,
    subject:`${subject}`,
    body:`${body}`
  }

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  
  myCallback('sent');

};

// a function for listing emails in a mailbox
function list_email(mailbox) {

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const email_id = email.id;
      const sender = email.sender;
      const subject = email.subject;
      const timestamp = email.timestamp;
      const read = email.read;
      const archivedstatus = email.archived;
      var backcolor = 'bg-white';
      if (read) {
        backcolor = 'bg-secondary';
      }
      
      // making the archive div
      const archiveDiv = document.createElement('div');
      const archiveButton = document.createElement('button');
      archiveDiv.classList.add("archiveDiv", "col-3", "m-2", "p-2");
      archiveButton.classList.add("archiveButton", 'btn', 'btn-primary');
      archiveButton.dataset.mailbox =  mailbox;
      archiveButton.dataset.archived = archivedstatus;
      archiveButton.dataset.id = email_id;
      archiveButton.innerHTML="Archive";
      archiveDiv.append(archiveButton);
      
      // making the main div
      const maindiv = document.createElement('div');
      const subdiv1 = document.createElement('div');
      const subdiv2 = document.createElement('div');
      const subdiv3 = document.createElement('div');
      maindiv.classList.add("email", "rounded-pill", "border", "border-success", "m-2", "p-2", `${backcolor}`, "row");
      subdiv1.classList.add("col-3");
      subdiv2.classList.add("col-6");
      subdiv3.classList.add("col-3");
    
      subdiv1.innerHTML = `${sender}`;
      subdiv2.innerHTML = `${subject}`;
      subdiv3.innerHTML = `${timestamp}`;
      
      maindiv.append(subdiv1, subdiv2, subdiv3);
      maindiv.dataset.id = email_id;
      
      // making the whole div
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.classList.add("row");
      div2.classList.add("col")
      div2.append(maindiv)
      div1.append(div2, archiveDiv);
      document.querySelector('#emails-view').append(div1);

    });
    
    // When on inbox or archive, archive button have to be shown
    
    if (mailbox === 'inbox' || mailbox === "archive"){
      document.querySelectorAll('.archiveDiv').forEach( (Div) => Div.style.display = 'block');
      document.querySelectorAll('.archiveButton').forEach( (button) => {
      
        if (button.dataset.archived === 'true') {
          button.innerHTML = 'Unarchive';
        } else {
          button.innerHTML = 'Archive';
        }
      
      })
    } else {
      document.querySelectorAll('.archiveDiv').forEach( (Div) => Div.style.display = 'none')
    }
    // highlighting on mouseover and opening onclick an email in mailbox
    selectemail();
    
    document.querySelectorAll('.archiveButton').forEach(button => {

      button.onclick = () => {
        if (button.dataset.archived === 'false') {
          archivedStatus (button);
          location.reload();
        } else {
          unarchivedStatus (button);
          location.reload();

        }
      } 

    })
    

  });
   
   

}

function selectemail() {
  
  document.querySelectorAll('.email').forEach( (email) => {
    email.onclick = ()=>{
      
      fetch(`/emails/${email.dataset.id}`)
      .then(response => response.json())
      .then(email => {
        emailStatus(email);
        load_mail(email);
        
      })
    }
  })
  
  document.querySelectorAll('.email').forEach( (email) => {
    email.onmouseover = ()=>{
      email.classList.add('border-5');
    }
  })
    
  document.querySelectorAll('.email').forEach( (email) => {
    email.onmouseout = ()=>{
      email.classList.remove('border-5');;
    }
  })
}

function load_mail(email) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mail information
  const subdiv1 = document.createElement('div');
  const subdiv2 = document.createElement('div');
  const subdiv3 = document.createElement('div');
  const subdiv4 = document.createElement('div');
  const subdiv5 = document.createElement('div');
  const hr = document.createElement('hr');
  
  subdiv1.innerHTML = `From: ${email.sender}`;
  subdiv2.innerHTML = `To: ${email.recipients}`;
  subdiv3.innerHTML = `Subject: ${email.subject}`;
  subdiv4.innerHTML = `Timestamp: ${email.timestamp}`;
  subdiv5.innerHTML = email.body;
  
  // related buttons
  const replyButton = document.createElement('button');
  replyButton.innerHTML = 'Reply';
  replyButton.classList.add("btn", "btn-primary","m-2");
  replyButton.id = "replyButton";
  
  const archiveButton = document.createElement('button');
  archiveButton.classList.add("archiveButton", "btn", "btn-primary","m-2");
  archiveButton.dataset.id = email.id;
  archiveButton.dataset.archived = email.archived;
  
  if (archiveButton.dataset.archived === 'false') {
    archiveButton.innerHTML = 'Archive';
  } else {
    archiveButton.innerHTML = 'Unarchive';
  }
  
  
  


  document.querySelector('#emails-view').innerHTML = '';
  document.querySelector('#emails-view').append(subdiv1, subdiv2, subdiv3, subdiv4, replyButton, archiveButton, hr, subdiv5);
  
  if (document.querySelector('h2').innerHTML === email.sender && document.querySelector('h2').innerHTML !== email.recipients[0]) {

    document.querySelector('.archiveButton').style.display = 'none';

  }


  document.querySelectorAll('.archiveButton').forEach(button => {

    button.onclick = () => {
      
      if (archiveButton.dataset.archived === 'false') {
        archiveemail(button.dataset.id);
        archiveButton.innerHTML = 'Unarchive';
        archiveButton.dataset.archived = "true";
        location.reload();
      } else {
        unarchiveemail(button.dataset.id);
        archiveButton.innerHTML = 'Archive';
        archiveButton.dataset.archived = "false";
        location.reload();
      }
      
    } 

  })

  reply(email.sender, email.subject, email.body, email.timestamp);

};

// reply an email
function reply(recipient, subject, body, timestamp) {

  document.querySelector('#replyButton').onclick = () => {
  
    compose_email();
    document.querySelector("#compose-recipients").value = recipient ;
    if (subject.slice(0,3) === 'Re:') {
      document.querySelector("#compose-subject").value = `${subject}`;
    } else {
      document.querySelector("#compose-subject").value = `Re: ${subject}`;
    }
    document.querySelector("#compose-body").value = `On ${timestamp} ${recipient} wrote:\n${body}` ;
  
  }

}


// mark an email as read

function emailStatus(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function archivedStatus (button) {

  archiveemail(button.dataset.id);

}

function unarchivedStatus (button) {

  unarchiveemail(button.dataset.id);

}



function archiveemail(email_id) {
      
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  });

}

function unarchiveemail(email_id) {
      
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  });

}

