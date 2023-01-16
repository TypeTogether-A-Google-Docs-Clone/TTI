import './home.scss';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Alert } from 'reactstrap';
import { useAppSelector, useAppDispatch } from 'app/config/store';
import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { IDocument } from 'app/shared/model/document.model';
import { getEntities, createEntity, updateEntity } from 'app/entities/document/document.reducer';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { IUser } from 'app/shared/model/user.model';
import { getUsers } from 'app/modules/administration/user-management/user-management.reducer';
import axios from 'axios';

export const Home = (props: any) => {
  const [editorContent, setEditorContent] = useState('');
  //content that the TinyMCE editor initializes to
  //   const [initialContent, setInitialContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  //toggles TinyMCE editability
  const [readOnly, setReadOnly] = useState(false);

  //assigned logged in account information to account
  const account = useAppSelector(state => state.authentication.account);
  const today = new Date().toISOString().substring(0, 10);
  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const documentEntity = useAppSelector(state => state.document.entity);
  const loading = useAppSelector(state => state.document.loading);

  //   useEffect(() => {
  //     dispatch(getEntities({}));
  //   }, []);

  const date = new Date();
  const showTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };

  const { id } = useParams<'id'>();

  const isNew = id === undefined;

  const users = useAppSelector(state => state.userManagement.users);

  const saveEntity = values => {
    values.createdDate = convertDateTimeToServer(values.createdDate);
    values.modifiedDate = convertDateTimeToServer(values.modifiedDate);

    const entity = {
      ...documentEntity,
      ...values,
      user: users.find(it => it.id.toString() === values.user.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };
  const [dirty, setDirty] = useState(false);
  useEffect(() => setDirty(false), ['']);
  const save = async () => {
    try {
      if (editorRef.current) {
        const content = editorRef.current.getContent();
        setDirty(false);
        editorRef.current.setDirty(false);
        setSaveStatus('Saving...');
        const response = await axios.post('/api/documents', {
          documentTitle: 'Quick Document',
          documentContent: content,
          createdDate: new Date(),
          modifiedDate: new Date(),
          user: {
            id: account.id,
            login: account.login,
          },
        });
        setSaveStatus('Saved');
      }
    } catch (error) {
      console.log(error);
      //handle error here
    }
  };
  const handleEditorChange = (content, editor) => {
    if (editorRef.current) {
      setDirty(editorRef.current.isDirty());
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          createdDate: displayDefaultDateTime(),
          modifiedDate: displayDefaultDateTime(),
        }
      : {
          ...documentEntity,
          createdDate: convertDateTimeFromServer(documentEntity.createdDate),
          modifiedDate: convertDateTimeFromServer(documentEntity.modifiedDate),
          user: documentEntity?.user?.id,
        };

  return (
    <div>
      <p></p>
      <Row>
        <Col md="12">
          {account?.login ? (
            <div className="Typetogether">
              <h2>Welcome to TypeTogether</h2>
              <div>
                <Alert color="success">You are logged in as user &quot;{account.login}&quot;.</Alert>
              </div>
              <div className="buttonFun">
                <Link to="/document" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
                  <FontAwesomeIcon icon="plus" />
                  &nbsp; View Your Documents
                </Link>

                {dirty && <p>You have unsaved content!</p>}
              </div>
              <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
                <ValidatedField
                  label="Document Title"
                  id="document-documentTitle"
                  name="documentTitle"
                  data-cy="documentTitle"
                  type="text"
                  validate={{
                    required: { value: true, message: 'This field is required.' },
                  }}
                />
              </ValidatedForm>
              <Editor
                id="editor"
                apiKey="pc7rqzul9mdcfrch6wdkvminyzqgq5isq7dd7jj5pdikjwnb"
                onInit={(evt, editor) => (editorRef.current = editor)}
                initialValue="Hello World"
                init={{
                  height: 500,
                  menubar: true,
                  skin: 'fluent',
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'code',
                    'help',
                    'wordcount',
                  ],
                  toolbar:
                    'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                }}
              />
              <div className="savebutton">
                <Button color="info" onClick={save}>
                  <FontAwesomeIcon icon="save" />
                  &nbsp; Save Document
                </Button>
              </div>
            </div>
          ) : (
            <div id="mybigblock" className="myblock">
              <div id="linksblock">
                <h3 className="myh3">Together We Create</h3>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <h4 className="myh4">
                  <i>"Coming together is a beginning, staying together is progress, and working together is success"</i>
                </h4>
                <p className="mypara">-Henry Ford&nbsp;&nbsp;&nbsp;&nbsp;</p>
                <br />
                <br />
                <br />
                <br />
                You don&apos;t have an account yet?&nbsp;
                <Link to="/account/register" className="alert-link">
                  Register a new account
                </Link>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
              </div>
              <div id="imageblock">
                <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" width="800" height="400" className="coll-img" />
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Home;
