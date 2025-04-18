import { useRef, useState } from "react";
import "./termsAndConditionStyles.css";
import NavBarV2 from "../navbarV2/NavBarV2";
const TermsAndCondition = () => {
  const section0Ref = useRef();
  const section1Ref = useRef();
  const section2Ref = useRef();
  const section3Ref = useRef();
  const section4Ref = useRef();
  const section5Ref = useRef();
  const section6Ref = useRef();
  const section7Ref = useRef();
  const section8Ref = useRef();
  const section9Ref = useRef();
  const section10Ref = useRef();
  const section11Ref = useRef();
  const section12Ref = useRef();
  const section13Ref = useRef();
  const section14Ref = useRef();
  const [activeTab, setActiveTab] = useState("sec0");

  const scrollIntoView = (ref, tab) => {
    setActiveTab(tab);
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <>
      <div className="container-content terms-condition">
        <h2>Terms and Condition</h2>
        <div className="tc-wrapper">
          <div className="nav-links">
            <ul>
              <li
                onClick={(e) => scrollIntoView(section0Ref, "sec0")}
                className={`${activeTab === "sec0" ? "active" : ""} `}
              >
                Title{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section1Ref, "sec1")}
                className={`${activeTab === "sec1" ? "active" : ""} `}
              >
                Introduction{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section2Ref, "sec2")}
                className={`${activeTab === "sec2" ? "active" : ""} `}
              >
                User Registration and Eligibility
              </li>
              <li
                onClick={(e) => scrollIntoView(section3Ref, "sec3")}
                className={`${activeTab === "sec3" ? "active" : ""} `}
              >
                Use of the Platform{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section4Ref, "sec4")}
                className={`${activeTab === "sec4" ? "active" : ""} `}
              >
                Renter’s Rules{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section5Ref, "sec5")}
                className={`${activeTab === "sec5" ? "active" : ""} `}
              >
                Owner’s Rules{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section6Ref, "sec6")}
                className={`${activeTab === "sec6" ? "active" : ""} `}
              >
                Rental Terms{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section7Ref, "sec7")}
                className={`${activeTab === "sec7" ? "active" : ""} `}
              >
                Buyer’s Rules{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section8Ref, "sec8")}
                className={`${activeTab === "sec8" ? "active" : ""} `}
              >
                Seller’s Rules{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section9Ref, "sec9")}
                className={`${activeTab === "sec9" ? "active" : ""} `}
              >
                Selling Terms{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section10Ref, "sec10")}
                className={`${activeTab === "sec10" ? "active" : ""} `}
              >
                User Conduct{" "}
              </li>
              <li
                onClick={(e) => scrollIntoView(section11Ref, "sec11")}
                className={`${activeTab === "sec11" ? "active" : ""} `}
              >
                Platform Responsibilities and Limitations
              </li>
              <li
                onClick={(e) => scrollIntoView(section12Ref, "sec12")}
                className={`${activeTab === "sec12" ? "active" : ""} `}
              >
                Account Suspension and Termination
              </li>
              <li
                onClick={(e) => scrollIntoView(section13Ref, "sec13")}
                className={`${activeTab === "sec13" ? "active" : ""} `}
              >
                Changes to Terms and Conditions
              </li>
              <li
                onClick={(e) => scrollIntoView(section14Ref, "sec14")}
                className={`${activeTab === "sec14" ? "active" : ""}`}
              >
                Contact Information
              </li>
            </ul>
          </div>

          <div className="content">
            <div ref={section0Ref}>
              <h3>Welcome to RenTUPeers!</h3>
              <p>
                Please carefully read these Terms and Conditions, as they will
                explain your legal rights and obligations. By accessing the
                RenTUPeers website, whether as a visitor or a user, you
                agree to abide by these Terms and Conditions ("Terms"), our
                Privacy Policy, and the applicable laws, rules, and regulations
                of the University (“TUP Student Handbook”, “TUP Policies”) and
                of the Government.
              </p>
              <p>
                When you list items for rent as an Owner (“Owner”) you agree to
                comply with the Owners’ Rules, and when you rent items from an
                Owner as a Renter (“Renter”) you agree to comply with the
                Renters’ Rules. When you list items for sale as a Seller
                (“Seller”) you agree to comply with the Sellers’ Rules, and when
                you buy items from a Seller as a Buyer (“Buyer”) you agree to
                comply with the Buyers’ Rules.
              </p>
            </div>

            <div ref={section1Ref}>
              <ul>
                <li className="section-title">Introduction </li>
                <ul>
                  <li>
                    1.1. RenTUPeers (“RenTUPeers”, “platform”, “we”,
                    “our”, “us”) is a peer-to-peer (“P2P”) website mainly for
                    renting of school-related materials (“item”) operated
                    exclusively for the undergraduate students enrolled in the
                    Technological University of the Philippines - Manila (“TUP”,
                    “TUP-M”, “University”, “campus”).
                  </li>
                  <li>
                    1.2. This website will serve as the online intermediary
                    platform for transactions (“Services”) that allow registered
                    and verified students (“User”, “parties”, “you”) to lend
                    items as an Owner, to rent items as a Borrower, to buy items
                    as a Buyer, and to sell items as a Seller.
                  </li>
                </ul>
              </ul>
            </div>

            <div ref={section2Ref}>
              <ul>
                <li className="section-title">
                  User Registration and Eligibility
                </li>
                <ul>
                  <li className="section-subtitle">2.1. Eligibility</li>
                  <ul>
                    <li>
                      2.1.1. You must be at least 18 and capable of forming a
                      binding contract to register as a user on this website.
                    </li>
                    <li>
                      2.1.2. You must be an active undergraduate TUP-M student.
                    </li>
                    <li>
                      2.1.3. Registration requires verification through your TUP
                      student ID. Hence, you are required to upload and update a
                      new picture of validated TUP ID, and a selfie with your
                      validated TUP ID every semester to maintain account
                      verification.
                    </li>
                  </ul>
                  <li className="section-subtitle">
                    2.2. Account Responsibilities
                  </li>
                  <ul>
                    <li>
                      2.2.1. You must provide accurate, current, and complete
                      information during the registration process. You are also
                      responsible for keeping your information up to date at all
                      times. You may review our Privacy Policy to learn more
                      about what information we collect and the use of it.
                    </li>
                    <li>
                      2.2.2. You are responsible for maintaining the
                      confidentiality of your account credentials and for all
                      the activities that occur under your account.
                    </li>
                    <li>
                      2.2.3. You may not register more than one (1) account as
                      well as assign, sell, share, or transfer your account to
                      another party.
                    </li>
                    <li>
                      2.2.4. Notify us immediately if you suspect unauthorized
                      access to your account.
                    </li>
                    <li>
                      2.2.5. We reserve the right to deny or terminate accounts
                      if verification fails.
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section3Ref}>
              <ul>
                <li className="section-title">Use of the Platform</li>
                <ul>
                  <li className="section-subtitle">3.1. Permitted Services</li>
                  <ul>
                    <li>3.1.1. You may use the platform:</li>
                    <ul>
                      <li>3.1.1.1. To list items for rent as an Owner.</li>
                      <li>
                        3.1.1.2. To rent items listed by the other party, and
                        post “Looking for” posts for items that were not up for
                        renting yet—provided that the item does not violate
                        these Terms and the TUP Student Handbook—as a Renter.
                      </li>
                      <li>3.1.1.3. To list items for sale as a Seller.</li>
                      <li>
                        3.1.1.4. To buy items listed by the other party as a
                        Buyer.
                      </li>
                    </ul>
                  </ul>
                  <li className="section-subtitle">
                    3.2. Transaction Restrictions
                  </li>
                  <ul>
                    <li>
                      3.2.1. All transactions must occur within the TUP-M campus
                      premises.
                    </li>
                    <li>
                      3.2.2. Off-campus transactions are strictly prohibited.
                    </li>
                    <li>
                      3.2.3. You are not allowed to list and post other services
                      such as but not limited to: academic support, technical,
                      creative, and personal assistance.
                    </li>
                    <li>
                      3.2.4. You are not allowed to rent more than one (1) of an
                      item type.
                    </li>
                    <li>
                      3.2.5. Violation of these Terms may result in account
                      suspension.
                    </li>
                  </ul>
                  <li className="section-subtitle">3.3. Prohibited Items</li>
                  <ul>
                    <li>
                      3.3.1. As a user, you agreed not to list and post items
                      for rent, to look for, or for sale that are
                      non-school-related, not hand-carry, consumable, illegal,
                      stolen, unsafe, and that violate TUP policies. Items such
                      as:
                    </li>
                    <ul>
                      <li>
                        3.3.1.1. Liquor and prohibited drugs are not allowed to
                        be listed to look for, or for sale.
                      </li>
                      <li>
                        3.3.1.2. Guns, firearms, ammunition, explosives,
                        incendiary devices, and detonation agents are not
                        allowed to be listed for rent, to look for, or for sale.
                      </li>
                      <li>
                        3.3.1.3. Sharp, pointed, bladed, or blunt weapons are
                        not allowed to be listed for rent, to look for, or for
                        sale unless such weapons are used for any official
                        school activity with discretion and permission from the
                        authority.
                      </li>
                      <li>
                        3.3.1.4. These offenses carry sanctions by the
                        University that you may review in p. 38-39 under the
                        Major Offenses of TUP Student Handbook.
                      </li>
                    </ul>
                    <li>
                      3.3.2. RenTUPeers reserves the right to remove item
                      listings from the website that are prohibited at any time.
                      RenTUPeers also reserves the right to remove item listings
                      from the site at any time for any or no reason, whether or
                      not they are listed in the list of prohibited items.
                    </li>
                    <li>
                      3.3.3. RenTUPeers reserves the right to update the list of
                      prohibited items at any time for any reason.
                    </li>
                  </ul>
                  <li className="section-subtitle">
                    3.4. Guidelines for Listings and Posts
                  </li>
                  <ul>
                    <li>
                      3.4.1. Items, to list for rent or for sale, must be in
                      good and working condition.
                    </li>
                    <li>
                      3.4.2. You must completely state the information about the
                      item and your availability schedule for item pickup and
                      return.
                    </li>
                    <li>
                      3.4.3. Item descriptions must be accurate, clear, and
                      truthful.
                    </li>
                    <li>
                      3.4.4. You should upload clear images of the items being
                      listed and posted.
                    </li>
                    <li>3.4.5. You must set a fair and reasonable price.</li>
                    <li>
                      3.4.6. You agree not to post anything obscene,
                      inappropriate, or indecent.{" "}
                    </li>
                    <li>
                      3.4.7. You agree not to post anything abusive,
                      threatening, or defamatory.{" "}
                    </li>
                    <li>
                      3.4.8. You agree not to post any misleading or false
                      material or use RenTUPeers to intentionally deceive
                      others.{" "}
                    </li>
                  </ul>
                  <li className="section-subtitle">3.5. Payment Methods</li>
                  <ul>
                    <li className="section-subtitle">3.5.1. Cash on Meetup</li>
                    <ul>
                      <li>
                        3.5.1.1. For Rental transactions, cash payment shall be
                        done upon the handover of the item to the Renter.
                      </li>
                      <li>
                        3.5.1.2. For Selling transactions, cash payment shall be
                        done upon the handover of the item to the Buyer.
                      </li>
                    </ul>
                    <li className="section-subtitle">3.5.2. Online Payment</li>
                    <ul>
                      <li>
                        3.5.2.1. Payments made through RenTUPeers are processed
                        through the payment processing platform, GCash. Please
                        read their full terms and conditions here: GCash.
                      </li>
                      <li>
                        3.5.2.2. For Rental transactions upon confirmation of
                        the handover of the item, the platform should redirect
                        the Renter to GCash.
                      </li>
                      <li>
                        3.5.2.3. For Selling transactions upon confirmation of
                        the handover of the item, the platform should redirect
                        the Buyer to GCash.
                      </li>
                      <li>
                        3.5.2.4. Duly note that this payment method is for
                        demonstration purposes of the website development only.
                        Hence, there should not be any real payment transactions
                        yet.
                      </li>
                    </ul>
                  </ul>
                  <li className="section-subtitle">3.6. Communication</li>
                  <ul>
                    <li>
                      3.6.1. All communication between Renters and Owners, and
                      Buyers and Sellers, should only be done through the
                      RenTUPeers platform.
                    </li>
                    <li>
                      3.6.2. As a User, you agree to use the communication tool
                      of the RenTUPeers platform between yourself and any other
                      User strictly for communication regarding an item of
                      interest, and a place to meet for item pickup and return.
                    </li>
                    <li>
                      3.6.3. As an Owner and a Seller, you agree not to contact
                      other Owners and Sellers through the RenTUPeers
                      communication tool with the intent to advertise your
                      items.
                    </li>
                    <li>
                      3.6.4. By using the RenTUPeers platform, you understand
                      that your communications can be monitored by RenTUPeers.
                      Please read our Privacy Policy for further information.
                    </li>
                  </ul>
                  <li className="section-subtitle">3.7. Leaving a Review</li>
                  <ul>
                    <li>
                      3.7.1. For every transaction completed, you agree to leave
                      reviews that provide accurate representation of the item
                      and the other party. Disinformation, misrepresentation, or
                      defamatory language may be cause for removal from the
                      RenTUPeers platform and could potentially lead to legal
                      action under the University.
                    </li>
                  </ul>
                  <li></li>
                </ul>
              </ul>
            </div>

            <div ref={section4Ref}>
              <ul>
                <li className="section-title">Renter Rules</li>
                <p>
                  Please carefully read these rules (“Renter Rules”) before
                  becoming a Renter using RenTUPeers. By using RenTUPeers, you
                  agree to the Renter Rules in addition to the Terms and
                  Conditions.{" "}
                </p>
                <ul>
                  <li className="section-subtitle">4.1. Renting of an Item</li>
                  <ul>
                    <li>
                      4.1.1. Renters may submit a rental request and appropriate
                      communication containing questions, comments, or requests
                      through RenTUPeers. A submission for a request is not a
                      guarantee that the item will be available for rent.
                    </li>
                    <li>
                      4.1.2. You can cancel the rental request as long as:
                    </li>
                    <ul>
                      <li>
                        4.1.1.1. The Owner has not accepted the request until
                        thirty (30) minutes before the transaction, if a rental
                        request was made an (1) hour from the chosen rental
                        period.
                      </li>
                      <li>
                        4.1.1.2. The Owner has not accepted the request until an
                        (1) hour before transaction, if a rental request was
                        made more than twenty-four (24) hours from the chosen
                        rental period.
                      </li>
                      <li>
                        4.1.1.3. Otherwise, if there is no action performed from
                        either side of the parties, RenTUPeers will presume to
                        approve the rental request and continue with the
                        transaction.
                      </li>
                    </ul>
                    <li>
                      4.1.3. As a renter, it is your responsibility to check the
                      condition of the item first before proceeding with the
                      transaction. If issues occur, you may perform the
                      following:{" "}
                    </li>
                    <ul>
                      <li>
                        4.1.3.1. If the item received is slightly damaged, you
                        may file a report by uploading an image and description
                        of the item's condition. Furthermore, you can choose to
                        cancel the transaction, and return the item.
                        <li>
                          4.1.3.2. If the item received is damaged to the extent
                          that it is not usable, you can report to cancel the
                          transaction along with the reason, and return the
                          item.
                        </li>
                        <li>
                          4.1.3.3. If the other party is absent upon the
                          handover of the item, you may file a report and cancel
                          the transaction.
                        </li>
                        <li>
                          4.1.3.4. Duly note that these must be done within ten
                          (10) minutes of your rental period. If there is no
                          action performed from either side of parties after an
                          (1) hour, RenTUPeers will presume to continue with the
                          transaction, and you can no longer file a report.
                        </li>
                      </li>
                    </ul>
                  </ul>
                  <li className="section-subtitle">4.2. Liability</li>
                  <ul>
                    <li>
                      4.2.1. Renters are granted a limited license to borrow the
                      item agreed upon by you and the Owner. This extends
                      through the duration of the agreed rental period.
                    </li>
                    <li>
                      4.2.2. By proceeding with the transaction, you agree to
                      the Rental Terms provided by the Owner of the item.
                    </li>
                    <li>
                      4.2.2. You agree to use the item for its intended purpose
                      only. If necessary, educate yourself on proper care and
                      handling of said item.
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section5Ref}>
              <ul>
                <li className="section-title">Owner’s Rules</li>
                <p>
                  Please carefully read these rules (“Owner Rules”) before
                  becoming an Owner using RenTUPeers. By using RenTUPeers, you
                  agree to the Owner Rules in addition to the Terms and
                  Conditions.{" "}
                </p>
                <ul>
                  <li className="section-subtitle">
                    5.1. Renting out of an Item
                  </li>
                  <ul>
                    <li>
                      5.1.1. All rental requests have to be declined by the
                      Owner before the request is marked as approved. Provided
                      that:
                    </li>
                    <ul>
                      <li>
                        5.1.1.1. If a rental request was made an (1) hour away
                        from the chosen rental period, you can only decline
                        thirty (30) minutes before the transaction.
                      </li>
                      <li>
                        5.1.1.2. If a rental request was made more than
                        twenty-four (24) hours from the chosen rental period,
                        you can only decline an (1) hour before the transaction.
                      </li>
                      <li>
                        5.1.1.3. Otherwise, if there is no action performed,
                        RenTUPeers will presume to approve the rental request,
                        and continue with the transaction.
                      </li>
                    </ul>
                    <li>
                      5.1.2. Owners may offer their item listing that matches or
                      is similar to the item in the “Looking for” Posts posted
                      by the Renters through RenTUPeers. A submission of an
                      offer is not a guarantee that the item will be rented.
                    </li>
                    <li>
                      5.1.3. As an owner, it is your responsibility to check the
                      condition of the item first before completing the
                      transaction. If issues occur, you may perform the
                      following:
                    </li>
                    <ul>
                      <li>
                        5.1.3.1. If the returned item is damaged, you may file a
                        report by uploading an image and description of the
                        item's condition.
                      </li>
                      <li>
                        5.1.3.3. If the other party is absent upon the return of
                        the item, you may file a report.
                      </li>
                      <li>
                        5.1.3.4. Furthermore, you can choose to cancel the
                        transaction.
                      </li>
                      <li>
                        5.1.3.4. Duly note that these must be done within ten
                        (10) minutes of your rental period. If there is no
                        action performed from either side of the parties after
                        an (1) hour, RenTUPeers will presume to complete the
                        transaction, and you can no longer file a report.
                      </li>
                    </ul>
                  </ul>
                  <li className="section-subtitle">5.2. Liability</li>
                  <ul>
                    <li>
                      5.2.1. You are granting a limited license to borrow and/or
                      use the item or service agreed upon by you and the Renter.
                      This extends through the duration of the agreed rental
                      period.
                    </li>
                    <li>
                      5.2.2. You may set a deposit before renting out your item.
                      The deposit cannot exceed the fair market value of your
                      item.{" "}
                    </li>
                    <li>
                      5.2.3. You claim full responsibility for the description
                      posted on your item.
                    </li>
                    <li>
                      5.2.4. You acknowledge that there is risk in renting your
                      items to others and that the transaction being entered
                      into is between you (the Owner) and the Renter.{" "}
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section6Ref}>
              <ul>
                <li className="section-title">Rental Terms</li>
                <ul>
                  <li className="section-subtitle">6.1. Rental Agreement</li>
                  <ul>
                    <li>
                      6.1.1. You acknowledge that you are not renting from
                      RenTUPeers.
                    </li>
                    <li>
                      6.1.2. All rental agreements are made directly between the
                      Owner and the Renter.
                    </li>
                    <li>
                      6.1.3. The terms of the rental must be clearly stated in
                      the listing.
                    </li>
                    <li>
                      6.1.4. Both parties are responsible for agreeing upon and
                      honoring the rental terms.
                    </li>
                  </ul>
                  <li className="section-subtitle">
                    6.2. Item Condition and Inspection
                  </li>
                  <ul>
                    <li>
                      6.2.1. Owners must provide accurate descriptions of the
                      item’s condition.
                    </li>
                    <li>
                      6.2.2. Renters should inspect items upon receiving them
                      and report any pre-existing damage immediately.
                    </li>
                  </ul>
                  <li className="section-subtitle">6.3. Rental Duration</li>
                  <ul>
                    <li>
                      6.3.1. Items must be returned on or before the agreed-upon
                      return date and time.
                    </li>
                    <li>
                      6.3.2. Late returns may incur additional fees, as
                      specified in the rental listing.
                    </li>
                  </ul>
                  <li className="section-subtitle">6.4. Damage and Loss</li>
                  <ul>
                    <li>
                      6.4.1. Renters are responsible for any damage or loss
                      during the rental period.
                    </li>
                    <li>
                      6.4.2. Owners may charge a fee or withhold part of the
                      deposit to cover repair or replacement costs.
                    </li>
                  </ul>
                  <li className="section-subtitle">6.5. Deposits</li>
                  <ul>
                    <li>6.5.1. Some rentals may require a security deposit.</li>
                    <li>
                      6.5.2. The deposit will be refunded upon the item's return
                      in good condition.
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section7Ref}>
              <ul>
                <li className="section-title">Buyer’s Rules</li>
                <p>
                  Please carefully read these rules (“Buyer Rules”) before
                  becoming a Buyer using RenTUPeers. By using RenTUPeers, you
                  agree to the Buyer Rules in addition to the Terms and
                  Conditions.
                </p>
                <ul>
                  <li className="section-subtitle">7.1. Buying an Item</li>
                  <ul>
                    <li>
                      7.1.1. Buyers may submit a request and appropriate
                      communication containing questions, comments, or requests
                      through RenTUPeers. A submission for a request is not a
                      guarantee that the item will be available for sale.
                    </li>
                    <li>7.1.2. You can cancel the request as long as:</li>
                    <ul>
                      <li>
                        7.1.2.1. The Seller has not accepted the request until
                        thirty (30) minutes before the transaction, if a request
                        was made an (1) hour from the chosen date and time.
                      </li>
                      <li>
                        7.1.2.2. The Seller has not accepted the request until
                        an (1) hour before the transaction, if a rental request
                        was made more than twenty-four (24) hours from the
                        chosen date and time.
                      </li>
                      <li>
                        7.1.2.3. Otherwise, if there is no action performed from
                        either side of the parties, RenTUPeers will presume to
                        approve the request and continue with the transaction.
                      </li>
                    </ul>
                    <li>
                      7.1.3. As a Buyer, it is your responsibility to check the
                      condition of the item first before proceeding with the
                      purchase. If issues occur, you may perform the following:{" "}
                    </li>
                    <ul>
                      <li>
                        7.1.3.1. If the item received is slightly damaged, you
                        may file a report by uploading an image and description
                        of the item's condition. Furthermore, you can choose to
                        cancel the transaction, and return the item.
                      </li>
                      <li>
                        7.1.3.2. If the item received is damaged to the extent
                        that it is not usable, you can report to cancel the
                        transaction along with the reason, and return the item.
                      </li>
                      <li>
                        7.1.3.3. If the other party is absent upon the meetup,
                        you may file a report and cancel the transaction.
                      </li>
                      <li>
                        7.1.3.4. Duly note that these must be done within ten
                        (10) minutes of your meetup. If there is no action
                        performed from either side of the parties after an (1)
                        hour, RenTUPeers will presume to continue with the
                        transaction, and you can no longer file a report.
                      </li>
                    </ul>
                    <li>
                      7.1.4. All sales are final unless otherwise stated by the
                      seller in the listing or in cases of misrepresentation.{" "}
                    </li>
                  </ul>
                  <li className="section-subtitle">7.2. Liability</li>
                  <ul>
                    <li>
                      7.2.1. By purchasing an item, you acknowledge that you
                      have reviewed the listing details and accept the item in
                      its described condition.
                    </li>
                    <li>
                      7.2.2. You acknowledge that there is risk in buying items
                      from others and that the transaction being entered into is
                      between you (the Buyer) and the Seller.{" "}
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section8Ref}>
              <ul>
                <li className="section-title">Seller’s Rules</li>
                <p>
                  Please carefully read these rules (“Seller Rules”) before
                  becoming a Seller using RenTUPeers. By using RenTUPeers, you
                  agree to the Seller Rules in addition to the Terms and
                  Conditions.
                </p>
                <ul>
                  <li className="section-subtitle">8.1. Selling an Item</li>
                  <ul>
                    <li>
                      8.1.1. All requests have to be declined by the Buyer
                      before the request is marked as approved. Provided that:
                    </li>
                    <ul>
                      <li>
                        8.1.1.1. If a request was made an (1) hour away from the
                        chosen date and time, you can only decline thirty (30)
                        minutes before the transaction.
                      </li>
                      <li>
                        8.1.1.2. If a rental request was made more than
                        twenty-four (24) hours from the chosen date and time,
                        you can only decline an (1) hour before the transaction.
                      </li>
                      <li>
                        8.1.1.3. Otherwise, if there is no action performed,
                        RenTUPeers will presume to approve the request, and
                        continue with the transaction.
                      </li>
                    </ul>
                    <li>
                      8.1.2. Sellers may offer their item listing that matches
                      or is similar to the item in the “Looking for” Posts
                      posted by the Buyers through RenTUPeers. A submission of
                      an offer is not a guarantee that the item will be sold.
                    </li>
                    <li>
                      8.1.3. As a Seller, it is your responsibility to check the
                      condition and functionality of the item first before
                      listing the item.
                    </li>
                    <li>
                      8.1.4. If the other party is absent upon the meetup, you
                      may file a report. Furthermore, you can choose to cancel
                      the transaction.
                    </li>
                    <li>
                      8.1.5. Duly note that this must be done within ten (10)
                      minutes of your meetup. If there is no action performed
                      from either side of the parties after an (1) hour,
                      RenTUPeers will presume to continue with the transaction,
                      and you can no longer file a report.
                    </li>
                  </ul>
                  <li className="section-subtitle">8.2. Liability</li>
                  <ul>
                    <li>
                      8.2.1. By listing an item for sale, you represent and
                      warrant that you have the legal right to sell the item,
                      and the item is free from any encumbrances or third-party
                      claims.
                    </li>
                    <li>
                      8.2.2. You claim full responsibility for the description
                      posted on your item.
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section9Ref}>
              <ul>
                <li className="section-title">Buying and Selling Terms</li>
                <ul>
                  <li className="section-subtitle">9.1. Selling Agreement</li>
                  <ul>
                    <li>
                      9.1.1. You acknowledge that you are not buying from
                      RenTUPeers.
                    </li>
                    <li>
                      9.1.2. All selling agreements are made directly between
                      the Seller and the Buyer.
                    </li>
                    <li>
                      9.1.3. Both parties must agree on payment terms before
                      finalizing transactions.
                    </li>
                    <li>
                      9.1.4. Both parties are responsible for agreeing upon and
                      honoring the terms.
                    </li>
                  </ul>
                  <li className="section-subtitle">
                    9.2. Item Condition and Inspection
                  </li>
                  <ul>
                    <li>
                      9.2.1. Sellers must provide accurate descriptions of the
                      item’s condition.
                    </li>
                    <li>
                      9.2.2. Buyers should inspect items upon receiving them and
                      report any misleading information immediately.
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section10Ref}>
              <ul>
                <li className="section-title">User Conduct</li>
                <ul>
                  <li className="section-subtitle">10.1. Expected Behavior</li>
                  <ul>
                    <li>10.1.1. As users, you agree to:</li>
                    <ul>
                      <li>
                        10.1.1.1. Treat each other with respect and honesty.
                      </li>
                      <li>
                        10.1.1.2. Conduct all interactions respectfully and with
                        honor.
                      </li>
                      <li>
                        10.1.1.3. Adhere to TUP campus rules during
                        transactions.
                      </li>
                      <li>
                        10.1.1.4. Be responsible for the care and timely return
                        of rented items.
                      </li>
                    </ul>
                  </ul>
                  <li className="section-subtitle">10.2. Prohibited Conduct</li>
                  <ul>
                    <li>10.2.1. As users, you shall not:</li>
                    <ul>
                      <li>10.2.1.1. Harass or threaten other users.</li>
                      <ul>
                        <li>
                          10.2.1.1.1. Coercing a person to do something against
                          his will, or engaging him into doing something
                          unlawful carries sanctions by the University that you
                          may review in p. 39 under the Major Offenses of TUP
                          Student Handbook.
                        </li>
                      </ul>
                      <li>
                        10.2.1.2. Create fake listings or engage in illegal
                        activities on the RenTUPeers platform.
                      </li>
                      <li>
                        10.2.1.3. Post misleading, spam, or deceptive practices,
                        including false advertising.
                      </li>
                      <li>10.2.1.3. Commit swindling.</li>
                      <ul>
                        <li>
                          10.2.1.3.1. Obtaining money, goods, or services from
                          other users through deceit, false pretenses, or fraud
                          carries sanctions by the University that you may
                          review in p. 39 under the Major Offenses of TUP
                          Student Handbook.
                        </li>
                      </ul>
                    </ul>
                  </ul>
                  <li className="section-subtitle">
                    10.3. Reporting Violations
                  </li>
                  <ul>
                    <li>
                      10.3.1. Report any violations or suspicious activity to
                      [support@example.com].
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section11Ref}>
              <ul>
                <li className="section-title">
                  Platform Responsibilities and Limitations
                </li>
                <ul>
                  <li className="section-subtitle">11.1. Platform Role </li>
                  <ul>
                    <li>
                      11.1.1. RenTUPeers is a P2P rental platform exclusively
                      for TUP-M students. This aims to connect Renters, who are
                      looking for a school-related material to rent, to Owners
                      who are willing to offer these school-related materials.
                      It also connects Buyers, who are willing to buy
                      second-hand school-related materials, to Sellers who are
                      willing to sell these used school-related materials.
                    </li>
                    <li>
                      11.1.2. RenTUPeers is an intermediary for the transaction
                      of a Renter renting an item from an Owner, and of a Buyer
                      buying an item from a Seller.
                    </li>
                    <li>
                      11.1.3. RenTUPeers acts as a facilitator and is not a
                      party to any transaction.
                    </li>
                    <li>
                      11.1.4. We are not liable for any issues arising from
                      transactions between users.
                    </li>
                  </ul>
                  <li className="section-subtitle">11.2. Disclaimers</li>
                  <ul>
                    <li>
                      11.2.1. You, a Renter, acknowledge that you are not
                      renting from RenTUPeers and we are not responsible for the
                      acts of omissions of either the Owner or the Renter in
                      relation to the transaction.
                    </li>
                    <li>
                      11.2.2. You, a Buyer, acknowledge that you are not buying
                      from RenTUPeers and we are not responsible for the acts of
                      omissions of either the Seller or the Buyer in relation to
                      the transaction.
                    </li>
                    <li>
                      11.2.3. We do not endorse or guarantee the quality,
                      safety, or legality of any items listed through RenTUPeers
                      or any content posted by the Users.
                    </li>
                    <li>11.2.4. Users shall transact at their own risk.</li>
                    <li>
                      11.2.5. RenTUPeers is not responsible for any issues
                      arising from off-campus transactions, and involvement of
                      third parties.
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section12Ref}>
              <ul>
                <li className="section-title">
                  Account Suspension and Termination
                </li>
                <ul>
                  <li className="section-subtitle">
                    12.1. Grounds for Suspension
                  </li>
                  <ul>
                    <li>12.1.1. Violation of these Terms.</li>
                    <li>
                      12.1.2. Misuse of the RenTUPeers platform or fraudulent
                      behavior.
                    </li>
                  </ul>
                  <li className="section-subtitle">12.2. Appeals</li>
                  <ul>
                    <li>
                      12.2.1. Users may appeal suspensions by contacting
                      support.
                    </li>
                  </ul>
                </ul>
              </ul>
            </div>

            <div ref={section13Ref}>
              <ul>
                <li className="section-title">
                  Changes to Terms and Conditions
                </li>
                <ul>
                  <li>
                    13.1. We may update these Terms from time to time. The
                    amended Terms and Conditions will be effective immediately
                    after it is first posted on our Website. Your continued use
                    of the platform will constitute acceptance of the new Terms.
                  </li>
                </ul>
              </ul>
            </div>

            <div ref={section14Ref}>
              <ul>
                <li className="section-title">Contact Information</li>
                <p>
                  For questions or support, contact us at: Email:
                  [support@example.com]
                </p>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndCondition;
