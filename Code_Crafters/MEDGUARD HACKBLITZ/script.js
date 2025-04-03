// Import Firebase modules from firebase.js
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

// Wait until DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent page reload

    // Get input values
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let fullName = document.getElementById("fullName").value;

    // Firebase Authentication - Sign Up
    try {
      let userCredential = await createUserWithEmailAndPassword(auth, email, password);
      let user = userCredential.user;

      // Store user details in Firestore Database
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        email: email,
        uid: user.uid
      });

      alert("Signup Successful! Redirecting...");
      window.location.href = "add_member.html"; // Redirect to Add Member page
    } catch (error) {
      console.error("Error:", error.message);
      alert("Signup Failed: " + error.message);
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("member-form");
    const familyList = document.getElementById("family-list");

    let familyMembers = JSON.parse(localStorage.getItem("familyMembers")) || [];

    // Function to display family members
    function displayMembers() {
        familyList.innerHTML = "";
        familyMembers.forEach((member, index) => {
            const memberCard = document.createElement("div");
            memberCard.classList.add("member-card");
            memberCard.innerHTML = `
                <h3>${member.name} (Age: ${member.age})</h3>
                <p><b>Medicine:</b> ${member.medicine}</p>
                <p><b>Time:</b> ${member.time}</p>
                <button onclick="deleteMember(${index})">Remove</button>
            `;
            familyList.appendChild(memberCard);
        });
    }

    // Function to add a new family member
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const medicine = document.getElementById("medicine").value;
        const time = document.getElementById("time").value;

        const newMember = { name, age, medicine, time };
        familyMembers.push(newMember);
        localStorage.setItem("familyMembers", JSON.stringify(familyMembers));

        form.reset();
        displayMembers();
        scheduleNotification(newMember);
    });

    // Function to delete a member
    window.deleteMember = function (index) {
        familyMembers.splice(index, 1);
        localStorage.setItem("familyMembers", JSON.stringify(familyMembers));
        displayMembers();
    };

    // Function to schedule medicine notifications
    function scheduleNotification(member) {
        const now = new Date();
        const [hour, minute] = member.time.split(":");
        const notificationTime = new Date();
        notificationTime.setHours(hour, minute, 0);

        const timeDifference = notificationTime - now;

        if (timeDifference > 0) {
            setTimeout(() => {
                alert(`Reminder: ${member.name} needs to take ${member.medicine}`);
            }, timeDifference);
        }
    }

    // Load stored members on page load
    displayMembers();
});
