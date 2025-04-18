import { Accordion } from "react-bootstrap";
import "./privacyPolicyStyles.css";
import NavBarV2 from "../navbarV2/NavBarV2";
const PrivacyPolicy = () => {
  return (
    <>
      <div className="container-content privacy-policy">
        <h2>Privacy Policy</h2>
        <div className="privacy-policy-wrapper">
          <div className="intro">
            <p>
              This privacy policy describes the policy of RenTUPeers
              regarding the collection, use, storage, sharing and protection of
              your personal information (“Privacy Policy”). This Privacy Policy
              applies to the RenTUPeers website (“Website”) and all related
              websites, applications, services and tools where reference is made
              to this policy (“Services”).{" "}
              <p>
                By using the Website and related Services, you give explicit
                consent to RenTUPeers for the collection, use, disclosure
                and retention of your personal information by us, as Campus
                Connect described in this Privacy Policy and our Terms and
                Conditions.{" "}
              </p>
              <p>
                You can visit our Website without registering for an account.
                When you decide to provide us with your personal information,
                you agree that such information is sent to and stored on our
                servers.{" "}
              </p>
              <p>
                We collect the following types of personal information:
                Information you provide to us:
              </p>
              <ul>
                <li>
                  We collect and store any information you enter on our Website
                  or that you provide to us when you use our Services.
                </li>{" "}
                <li>
                  Additional information that you may provide to us through
                  third party Services except personal information.
                </li>
              </ul>
            </p>
          </div>
          <div className="accordion-wrapper">
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  How we use your personal information
                </Accordion.Header>
                <Accordion.Body>
                  <p>
                    You agree that we may use your personal information (see
                    above) for the following purposes:
                  </p>
                  <ul>
                    <li>
                      To provide you access to our Services and Customer Support
                      by means of e-mail;
                    </li>
                    <li>
                      To analyze site usage, improve content and product
                      offerings, and customize Services;
                    </li>
                    <li>
                      To prevent, detect, monitor, and investigate potentially
                      prohibited or illegal activities, fraud and security
                      breaches and to enforce our Terms;
                    </li>
                    <li>
                      To resolve disputes by disclosing any your site
                      information, postings, and messages relative to any
                      investigation concerning activities deemed criminal or
                      illegal in nature;
                    </li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              {/*  */}
              <Accordion.Item eventKey="1">
                <Accordion.Header>Intellectual Property</Accordion.Header>
                <Accordion.Body>
                  All content on our website, including text, graphics, logos,
                  images, and software, is the property of RenTUPeers and is
                  protected by copyright and other intellectual property laws.
                  You may not use, reproduce, or distribute any of our content
                  without our prior written consent. <br /> <br />
                  Submitting content such as listings, posts, review, and
                  feedback, will imply that you agree to grant us a
                  non-exclusive, royalty-free, worldwide license to use,
                  display, and reproduce it.
                </Accordion.Body>
              </Accordion.Item>
              {/*  */}
              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  Protect and retention of your personal information
                </Accordion.Header>
                <Accordion.Body>
                  We protect your information by using technical and
                  administrative security measures (such as firewalls, data
                  encryption, and physical and administrative access controls to
                  the data and servers) that limit the risk of loss, abuse,
                  unauthorized access, disclosure, and alteration. Nevertheless,
                  if you believe your account has been abused, please contact us
                  through email at [support@example.com].
                </Accordion.Body>
              </Accordion.Item>
              {/*  */}
              <Accordion.Item eventKey="3">
                <Accordion.Header>Other information</Accordion.Header>
                <Accordion.Body>
                  Abuse and unsolicited commercial communications (“spam”): We
                  do not tolerate abuse of our Website. It is not allowed to use
                  our member-to-member communication resources to send spam or
                  content that violates our Terms any other way. For your
                  security, we may scan messages automatically and check for
                  spam, viruses, phishing and other malicious activity or
                  illegal or prohibited content. <br /> <br />
                  Third Parties: Unless explicitly provided otherwise in this
                  Privacy Policy, this Privacy Policy applies only to the use
                  and transfer of information we collect from you. Yoodlize has
                  no control over the privacy policies of third parties that may
                  apply to you.
                </Accordion.Body>
              </Accordion.Item>
              {/*  */}
              <Accordion.Item eventKey="4">
                <Accordion.Header>Changes to Privacy Policy</Accordion.Header>
                <Accordion.Body>
                  RenTUPeers may change this Privacy Policy from time to
                  time. The amended Privacy Policy will be effective immediately
                  after it is first posted on our Website. Your continued use of
                  the platform will constitute acceptance of the new Terms.
                </Accordion.Body>
              </Accordion.Item>
              {/*  */}
              <Accordion.Item eventKey="5">
                <Accordion.Header>Contact Information</Accordion.Header>
                <Accordion.Body>
                  <p>For questions or support, contact us at:</p>{" "}
                  <p>Email: [support@example.com]</p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
