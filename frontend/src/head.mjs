
class SeatBookingTitle extends HTMLElement {
    connectedCallback() {
        // Create a Date object representing the current date.
        const now = new Date()

        // Format the date to a human-friendly string, and set the
        // formatted date as the text content of this element.
        this.textContent = 'Seat Booking App'
    }
    // component implementation goes here
}


customElements.define('seat-booking-head', SeatBookingTitle)
