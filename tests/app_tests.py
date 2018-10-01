import unittest
import uuid

import app
    
class AppTestCase(unittest.TestCase):

    def setUp(self):
        self.client = app.app.test_client()


    def test_uuid_generated(self):
        resp = self.client.get('/')
        assert uuid.UUID(resp.data)